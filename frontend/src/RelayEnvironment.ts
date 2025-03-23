import {
  Environment,
  Network,
  RecordSource,
  Store,
  type GraphQLResponse,
} from 'relay-runtime';

// Optional: Utility for global ID handling
export function toGlobalId(type: string, id: string): string {
  return `${type}:${id}`;
}

export function fromGlobalId(globalId: string): { type: string; id: string } {
  const [type, id] = globalId.split(':');
  if (!type || !id) {
    throw new Error(`Invalid global ID format: ${globalId}`);
  }
  return { type, id };
}

const fetchQuery = (
  request: unknown,
  variables: Record<string, unknown>,
): Promise<GraphQLResponse> => {
  const operation = request as { text: string | null | undefined };
  
  // Use a relative path instead of absolute localhost URL
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'pragma': 'no-cache',
      'cache-control': 'no-cache, no-store, must-revalidate',
      'expires': '0'
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from Relay
      variables,
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(json => {
    // Check if the response contains GraphQL errors
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error(`GraphQL Error: ${json.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }
    return json;
  })
  .catch(error => {
    console.error('Relay query error:', error);
    throw error;
  });
}

export const RelayEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

// Function to recreate the environment and clear all caches
export function resetRelayEnvironment(): void {
  // Create a new source and store
  const source = new RecordSource();
  const store = new Store(source);
  
  // Update the environment with the new store
  Object.assign(RelayEnvironment, {
    store,
    network: Network.create(fetchQuery),
  });
} 