/**
 * SOQL query parser for extracting SOQL queries from Apex code
 */

import { logger } from '../utils/logger.js';
import { SOQLParseError } from '../utils/apex-errors.js';
import type { SOQLQueryDefinition, SOQLClauseDefinition } from '../types/apex-parsed.js';

/**
 * Extracts SOQL queries from Apex code
 */
export function extractSOQLQueries(code: string, context?: string): SOQLQueryDefinition[] {
  const queries: SOQLQueryDefinition[] = [];
  
  try {
    // Match static SOQL queries: [SELECT ... FROM ... WHERE ...]
    const staticSOQLRegex = /\[\s*SELECT\s+([^\]]+)\s*\]/gi;
    let match;
    
    while ((match = staticSOQLRegex.exec(code)) !== null) {
      const queryString = match[0];
      const selectClause = match[1];
      
      const query = parseSOQLQuery(queryString, selectClause, false, context);
      if (query) {
        queries.push(query);
      }
    }
    
    // Match dynamic SOQL queries: Database.query('SELECT ...')
    const dynamicSOQLRegex = /Database\.query\s*\(\s*['"]([^'"]+)['"]\s*\)/gi;
    while ((match = dynamicSOQLRegex.exec(code)) !== null) {
      const queryString = match[1];
      const fullQuery = `SELECT ${queryString}`;
      
      const query = parseSOQLQuery(fullQuery, queryString, true, context);
      if (query) {
        queries.push(query);
      }
    }
    
    // Match String.escapeSingleQuotes with SOQL (common pattern)
    const escapedSOQLRegex = /String\.escapeSingleQuotes\s*\(\s*['"]([^'"]+)['"]\s*\)/gi;
    while ((match = escapedSOQLRegex.exec(code)) !== null) {
      const queryString = match[1];
      if (queryString.toUpperCase().includes('SELECT')) {
        const query = parseSOQLQuery(queryString, queryString, true, context);
        if (query) {
          queries.push(query);
        }
      }
    }
    
    return queries;
  } catch (error) {
    logger.warn({ error }, 'Failed to extract SOQL queries');
    throw new SOQLParseError('Failed to extract SOQL queries', undefined, error instanceof Error ? error : undefined);
  }
}

/**
 * Parses a SOQL query string into structured format
 */
function parseSOQLQuery(
  queryString: string,
  selectClause: string,
  isDynamic: boolean,
  context?: string
): SOQLQueryDefinition | null {
  try {
    // Extract SELECT fields
    const fieldsMatch = selectClause.match(/SELECT\s+(.+?)\s+FROM/i);
    const fieldsStr = fieldsMatch ? fieldsMatch[1] : selectClause.split(/\s+FROM/i)[0];
    const fields = fieldsStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    
    // Extract FROM object
    const fromMatch = queryString.match(/FROM\s+(\w+)/i);
    const object = fromMatch ? fromMatch[1] : undefined;
    
    // Extract WHERE clause
    const whereMatch = queryString.match(/WHERE\s+([^ORDER|GROUP|HAVING|LIMIT]+)/i);
    const whereClause: SOQLClauseDefinition | undefined = whereMatch
      ? {
          type: 'WHERE',
          content: whereMatch[1].trim(),
        }
      : undefined;
    
    // Extract ORDER BY clause
    const orderByMatch = queryString.match(/ORDER\s+BY\s+([^GROUP|HAVING|LIMIT]+)/i);
    const orderByClause: SOQLClauseDefinition | undefined = orderByMatch
      ? {
          type: 'ORDER BY',
          content: orderByMatch[1].trim(),
        }
      : undefined;
    
    // Extract GROUP BY clause
    const groupByMatch = queryString.match(/GROUP\s+BY\s+([^HAVING|LIMIT]+)/i);
    const groupByClause: SOQLClauseDefinition | undefined = groupByMatch
      ? {
          type: 'GROUP BY',
          content: groupByMatch[1].trim(),
        }
      : undefined;
    
    // Extract HAVING clause
    const havingMatch = queryString.match(/HAVING\s+([^LIMIT]+)/i);
    const havingClause: SOQLClauseDefinition | undefined = havingMatch
      ? {
          type: 'HAVING',
          content: havingMatch[1].trim(),
        }
      : undefined;
    
    // Extract LIMIT clause
    const limitMatch = queryString.match(/LIMIT\s+(\d+)/i);
    const limitClause: SOQLClauseDefinition | undefined = limitMatch
      ? {
          type: 'LIMIT',
          content: limitMatch[1],
        }
      : undefined;
    
    return {
      queryString: queryString.trim(),
      object,
      fields: fields.length > 0 ? fields : undefined,
      whereClause,
      orderByClause,
      groupByClause,
      havingClause,
      limitClause,
      isDynamic,
      context,
    };
  } catch (error) {
    logger.warn({ queryString, error }, 'Failed to parse SOQL query');
    return null;
  }
}

