/**
 * Type utilities for working with Relay-generated types
 */

/**
 * Extracts the response type from a Relay query type
 * This allows simplified usage of query types without having to use ['response']
 * 
 * @example
 * // Instead of:
 * const data = useLazyLoadQuery<MyQuery['response']>(query, variables);
 * 
 * // You can use:
 * const data = useLazyLoadQuery<ResponseType<MyQuery>>(query, variables);
 */
export type ResponseType<T> = T extends { response: infer R } ? R : never; 