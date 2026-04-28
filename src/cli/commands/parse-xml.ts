/**
 * `parse` command — parses XML metadata (objects, profiles, permission sets),
 * builds cross-references, and writes parsed JSON + relationship graph.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { validatePath, getPath } from '../../scanner/path-validator.js';
import { scanDirectory, processFilesInParallel } from '../../scanner/file-scanner.js';
import { logger } from '../../utils/logger.js';
import { parseAllObjects } from '../../parser/object-parser-integration.js';
import { parseProfileXML } from '../../parser/profile-parser.js';
import { parsePermissionSetXML } from '../../parser/permissionset-parser.js';
import { RelationshipGraphImpl } from '../../parser/relationship-graph.js';
import { ParsedXMLResultsImpl } from '../../parser/xml-results.js';
import { CrossReferenceBuilder } from '../../parser/cross-reference.js';
import {
  saveParsedXMLResults,
  saveRelationshipGraph,
} from '../../parser/xml-results-persistence.js';

export interface ParseXmlOptions {
  output?: string;
  relationships?: string;
  concurrency?: number;
  testDefault?: boolean;
  objectsOnly?: boolean;
  profilesOnly?: boolean;
  permissionsetsOnly?: boolean;
}

const DEFAULTS = {
  output: './parsed-results',
  relationships: './relationship-graph.json',
  concurrency: 10,
};

export async function runParseXml(
  pathArg: string | undefined,
  options: ParseXmlOptions = {},
): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting XML metadata parsing');

  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const output = options.output ?? DEFAULTS.output;
  const relationships = options.relationships ?? DEFAULTS.relationships;

  const relationshipGraph = new RelationshipGraphImpl();
  const results = new ParsedXMLResultsImpl(relationshipGraph);
  const crossRefBuilder = new CrossReferenceBuilder();

  // Parse objects
  if (!options.profilesOnly && !options.permissionsetsOnly) {
    logger.info('Parsing object XML files...');
    const objectResult = await parseAllObjects({ metadataPath, concurrency });

    for (const obj of objectResult.objects) {
      results.addObject(obj);
      for (const rel of obj.relationships) {
        relationshipGraph.addRelationship(rel, obj.fullName);
      }
    }

    logger.info(
      {
        parsed: objectResult.objects.length,
        errors: objectResult.errors,
        warnings: objectResult.warnings,
      },
      'Object parsing completed',
    );
  }

  // Parse profiles
  if (!options.objectsOnly && !options.permissionsetsOnly) {
    logger.info('Parsing profile XML files...');
    const scanResult = await scanDirectory({
      path: metadataPath,
      includePatterns: ['**/profiles/**/*.profile-meta.xml'],
    });

    let profileCount = 0;
    let profileWarnings = 0;

    await processFilesInParallel(
      scanResult.files,
      async (filePath) => {
        try {
          const profile = await parseProfileXML(filePath);
          results.addProfile(profile);
          profileCount++;
          return profile;
        } catch (error) {
          profileWarnings++;
          logger.warn({ filePath, error }, 'Failed to parse profile XML');
          return null;
        }
      },
      concurrency,
    );

    logger.info({ parsed: profileCount, warnings: profileWarnings }, 'Profile parsing completed');
  }

  // Parse permission sets
  if (!options.objectsOnly && !options.profilesOnly) {
    logger.info('Parsing permission set XML files...');
    const scanResult = await scanDirectory({
      path: metadataPath,
      includePatterns: ['**/permissionsets/**/*.permissionset-meta.xml'],
    });

    let permSetCount = 0;
    let permSetWarnings = 0;

    await processFilesInParallel(
      scanResult.files,
      async (filePath) => {
        try {
          const permSet = await parsePermissionSetXML(filePath);
          results.addPermissionSet(permSet);
          permSetCount++;
          return permSet;
        } catch (error) {
          permSetWarnings++;
          logger.warn({ filePath, error }, 'Failed to parse permission set XML');
          return null;
        }
      },
      concurrency,
    );

    logger.info(
      { parsed: permSetCount, warnings: permSetWarnings },
      'Permission set parsing completed',
    );
  }

  logger.info('Building cross-references...');
  crossRefBuilder.buildCrossReferences(
    results.getAllParsedProfiles(),
    results.getAllParsedPermissionSets(),
    results.getAllParsedObjects(),
  );

  logger.info('Saving parsed results...');
  await saveParsedXMLResults(results, `${output}/parsed-xml-results.json`);

  const relationshipsPath = relationships.startsWith('./')
    ? join(output, relationships.replace(/^\.\//, ''))
    : relationships;
  await saveRelationshipGraph(relationshipGraph.toJSON(), relationshipsPath);

  const allObjects = Array.from(results.objects.values());
  const crossRefSummary = {
    objectToProfiles: Object.fromEntries(
      allObjects.map((obj) => [obj.fullName, crossRefBuilder.getProfilesForObject(obj.fullName)]),
    ),
    objectToPermissionSets: Object.fromEntries(
      allObjects.map((obj) => [
        obj.fullName,
        crossRefBuilder.getPermissionSetsForObject(obj.fullName),
      ]),
    ),
    generatedAt: new Date().toISOString(),
  };

  await mkdir(output, { recursive: true });
  await writeFile(
    `${output}/cross-references.json`,
    JSON.stringify(crossRefSummary, null, 2),
    'utf-8',
  );

  logger.info(
    {
      objects: results.objects.size,
      profiles: results.profiles.size,
      permissionSets: results.permissionSets.size,
      relationships: relationshipGraph.nodes.size,
      outputDir: output,
    },
    'XML parsing completed successfully',
  );
}

export async function parseXmlAction(pathArg: string, options: ParseXmlOptions): Promise<void> {
  try {
    await runParseXml(pathArg, options);
  } catch (error) {
    logger.error({ error }, 'XML parsing failed');
    process.exit(1);
  }
}
