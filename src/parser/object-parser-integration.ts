/**
 * Integration of object parser with file scanner
 */

import { scanDirectory } from '../scanner/file-scanner.js';
import { processFilesInParallel } from '../scanner/file-scanner.js';
import { parseObjectXML } from './object-parser.js';
import { parseFieldXML } from './field-parser.js';
import { parseValidationRuleXML } from './validationrule-parser.js';
import { parseRecordTypeXML } from './recordtype-parser.js';
import type { ObjectDefinition, FieldDefinition, ValidationRule, RecordType, Relationship } from '../types/xml-parsed.js';
import { logger } from '../utils/logger.js';
import { XMLParseError } from '../utils/xml-errors.js';

/**
 * Configuration for object parsing
 */
export interface ObjectParseConfig {
  metadataPath: string;
  concurrency?: number;
}

/**
 * Result of parsing object XML files
 */
export interface ObjectParseResult {
  objects: ObjectDefinition[];
  errors: number;
  warnings: number;
}

/**
 * Extracts relationships from fields
 */
function extractRelationshipsFromFields(fields: FieldDefinition[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (const field of fields) {
    if (field.referenceTo && field.type === 'MasterDetail') {
      const relatedObjects = Array.isArray(field.referenceTo)
        ? field.referenceTo
        : [field.referenceTo];
      for (const relatedObject of relatedObjects) {
        relationships.push({
          fieldName: field.fullName,
          type: 'MasterDetail',
          relatedObject: String(relatedObject),
          relationshipName: field.relationshipName,
          cascadeDelete: field.cascadeDelete,
          restrictedDelete: field.restrictedDelete,
          reparentableMasterDetail: field.reparentableMasterDetail,
        });
      }
    } else if (field.referenceTo && field.type === 'Lookup') {
      const relatedObjects = Array.isArray(field.referenceTo)
        ? field.referenceTo
        : [field.referenceTo];
      for (const relatedObject of relatedObjects) {
        relationships.push({
          fieldName: field.fullName,
          type: 'Lookup',
          relatedObject: String(relatedObject),
          relationshipName: field.relationshipName,
        });
      }
    }
  }

  return relationships;
}

/**
 * Parses all object XML files and their related files (fields, validation rules, record types)
 */
export async function parseAllObjects(
  config: ObjectParseConfig
): Promise<ObjectParseResult> {
  const { metadataPath, concurrency = 10 } = config;
  let errors = 0;
  let warnings = 0;

  logger.info({ path: metadataPath }, 'Starting object XML parsing');

  // Scan for object XML files
  const objectScanResult = await scanDirectory({
    path: metadataPath,
    includePatterns: ['**/objects/**/*.object-meta.xml'],
  });

  logger.info({ fileCount: objectScanResult.files.length }, 'Found object XML files');

  // Parse objects with their related files
  const objects = await processFilesInParallel(
    objectScanResult.files,
    async (objectFilePath) => {
      try {
        // Parse the main object XML file
        const objectDef = await parseObjectXML(objectFilePath);
        
        // Extract object name and directory from path
        const pathParts = objectFilePath.split('/');
        const objectsIndex = pathParts.findIndex((part) => part === 'objects');
        if (objectsIndex < 0) {
          logger.warn({ filePath: objectFilePath }, 'Could not determine object directory');
          return objectDef;
        }
        
        const objectDir = pathParts.slice(0, objectsIndex + 2).join('/');
        
        // Scan and parse fields
        try {
          const fieldScanResult = await scanDirectory({
            path: objectDir,
            includePatterns: ['fields/*.field-meta.xml'],
          });
          
          const fields = await processFilesInParallel(
            fieldScanResult.files,
            async (fieldPath) => {
              try {
                return await parseFieldXML(fieldPath);
              } catch (error) {
                warnings++;
                logger.warn({ filePath: fieldPath, error }, 'Failed to parse field XML');
                return null;
              }
            },
            concurrency
          );
          
          const validFields = fields.filter((f): f is FieldDefinition => f !== null);
          objectDef.fields = [...objectDef.fields, ...validFields];
        } catch (error) {
          logger.warn({ objectDir, error }, 'Failed to scan fields directory');
        }
        
        // Scan and parse validation rules
        try {
          const validationRuleScanResult = await scanDirectory({
            path: objectDir,
            includePatterns: ['validationRules/*.validationRule-meta.xml'],
          });
          
          const validationRules = await processFilesInParallel(
            validationRuleScanResult.files,
            async (rulePath) => {
              try {
                return await parseValidationRuleXML(rulePath);
              } catch (error) {
                warnings++;
                logger.warn({ filePath: rulePath, error }, 'Failed to parse validation rule XML');
                return null;
              }
            },
            concurrency
          );
          
          const validRules = validationRules.filter((r): r is ValidationRule => r !== null);
          objectDef.validationRules = [...objectDef.validationRules, ...validRules];
        } catch (error) {
          logger.warn({ objectDir, error }, 'Failed to scan validation rules directory');
        }
        
        // Scan and parse record types
        try {
          const recordTypeScanResult = await scanDirectory({
            path: objectDir,
            includePatterns: ['recordTypes/*.recordType-meta.xml'],
          });
          
          const recordTypes = await processFilesInParallel(
            recordTypeScanResult.files,
            async (rtPath) => {
              try {
                return await parseRecordTypeXML(rtPath);
              } catch (error) {
                warnings++;
                logger.warn({ filePath: rtPath, error }, 'Failed to parse record type XML');
                return null;
              }
            },
            concurrency
          );
          
          const validRecordTypes = recordTypes.filter((rt): rt is RecordType => rt !== null);
          objectDef.recordTypes = [...objectDef.recordTypes, ...validRecordTypes];
        } catch (error) {
          logger.warn({ objectDir, error }, 'Failed to scan record types directory');
        }
        
        // Extract relationships from all fields
        objectDef.relationships = extractRelationshipsFromFields(objectDef.fields);
        
        return objectDef;
      } catch (error) {
        if (error instanceof XMLParseError) {
          warnings++;
          logger.warn({ filePath: objectFilePath, error: error.message }, 'Failed to parse object XML');
        } else {
          errors++;
          logger.error({ filePath: objectFilePath, error }, 'Error parsing object XML');
        }
        return null;
      }
    },
    concurrency
  );

  const validObjects = objects.filter((obj): obj is ObjectDefinition => obj !== null);

  logger.info(
    {
      totalFiles: objectScanResult.files.length,
      parsedObjects: validObjects.length,
      errors,
      warnings,
    },
    'Object XML parsing completed'
  );

  return {
    objects: validObjects,
    errors,
    warnings,
  };
}

