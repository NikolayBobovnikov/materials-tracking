/**
 * Runtime validation utilities for data structures
 * These help catch issues that TypeScript might miss due to type assertions or coercion
 */

/**
 * Validates that data from Relay queries has the expected structure
 * Useful for catching issues where the API shape doesn't match the expected types
 * 
 * @param data - The data returned from a Relay query
 * @param componentName - The name of the component for error logging
 * @returns void
 */
export function validateRelayData(data: unknown, componentName: string): void {
  if (process.env.NODE_ENV !== 'production') {
    if (data === undefined || data === null) {
      console.error(`[${componentName}] Relay data is null or undefined`);
    } else if (typeof data !== 'object') {
      console.error(`[${componentName}] Relay data is not an object`, data);
    }
  }
}

/**
 * Validates that a connection (edges/nodes) from Relay has expected structure
 * Helps catch missing or malformed connection data
 * 
 * @param connection - The connection object from Relay containing edges and pageInfo
 * @param fieldName - The name of the field for error logging
 * @param componentName - The name of the component for error logging
 * @returns boolean - Whether the connection is valid
 */
export function validateRelayConnection(
  connection: unknown, 
  fieldName: string, 
  componentName: string
): boolean {
  if (process.env.NODE_ENV !== 'production') {
    if (!connection) {
      console.error(`[${componentName}] Connection "${fieldName}" is null or undefined`);
      return false;
    }

    const conn = connection as Record<string, unknown>;
    
    if (!conn.edges) {
      console.error(`[${componentName}] Connection "${fieldName}" is missing edges property`);
      return false;
    }
    
    if (!Array.isArray(conn.edges)) {
      console.error(`[${componentName}] Connection "${fieldName}.edges" is not an array`);
      return false;
    }
    
    if (!conn.pageInfo) {
      console.error(`[${componentName}] Connection "${fieldName}" is missing pageInfo property`);
      return false;
    }
    
    return true;
  }
  
  // In production, don't do validation to avoid performance overhead
  return true;
} 