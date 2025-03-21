import {
  Environment,
  Network,
  RecordSource,
  Store,
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
): Promise<Record<string, unknown>> => {
  const operation = request as { text: string | null | undefined };
  return fetch('http://localhost:5000/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from Relay
      variables,
    }),
  }).then(response => response.json());
}

export const RelayEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
}); 