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
  return { type, id };
}

const fetchQuery = (
  operation: any,
  variables: any,
) => {
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