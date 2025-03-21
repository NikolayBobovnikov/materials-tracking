# Type Safety Guidelines

This document provides guidelines for ensuring type safety in our React/Relay application.

## Common Type Safety Issues

### 1. Relay Query Type Usage

When using Relay query data, always use the correct type pattern:

```typescript
// INCORRECT
const data = useLazyLoadQuery<MyQuery>(
  query,
  variables
);

// CORRECT
const data = useLazyLoadQuery<MyQuery['response']>(
  query,
  variables
);
```

The `response` property access ensures you're getting the actual data structure.

### 2. Edge Object Typing

When mapping over edges from Relay connections, always type the edge parameter:

```typescript
// INCORRECT
data.items.edges.map((edge) => { ... });

// CORRECT - Option 1: Define an EdgeType
type EdgeType = {
  cursor: string;
  node: {
    id: string;
    // other node properties
  } | null;
} | null;

data.items.edges.map((edge: EdgeType) => { ... });

// CORRECT - Option 2: Use proper type guards
data.items.edges.map((edge) => {
  if (!edge || !edge.node) return null;
  const node = edge.node;
  // Now typescript knows node is not null
});
```

### 3. Conditional Rendering with Null Checks

Always check for null/undefined values when accessing potentially nullable fields:

```typescript
// INCORRECT
return <div>{data.items.edges.map(...)}</div>;

// CORRECT
if (!data.items || !data.items.edges) {
  return <div>No items found</div>;
}

return <div>{data.items.edges.map(...)}</div>;
```

### 4. RelayEnvironment TypeScript Setup

The `fetchQuery` function in `RelayEnvironment.ts` must return a properly typed `GraphQLResponse`:

```typescript
// INCORRECT
const fetchQuery = (): Promise<Record<string, unknown>> => { ... }

// CORRECT
const fetchQuery = (): Promise<GraphQLResponse> => { ... }
```

## Environment Consistency

To ensure consistent behavior between development and production environments:

1. **Lock Dependencies**: Always commit `package-lock.json` to ensure identical dependency versions
2. **CI Verification**: All PRs must pass the CI pipeline that runs with the same Node.js version as production
3. **Explicit Import Paths**: Prefer using relative paths starting with `./` for local imports
4. **Test Multiple Node Versions**: Our CI tests against Node 16.x and 18.x to catch version-specific issues

## Code Reviews

During code reviews, pay special attention to:

1. Using proper typing for all functions and variables
2. Avoiding `any` types wherever possible
3. Using proper null checking for data that might be null/undefined
4. Testing edge cases where data structures might be incomplete

## Automatic Verification

Our project uses the following automatic verification steps:

1. **TypeScript Compiler**: `npm run type-check` verifies type safety
2. **ESLint**: `npm run lint` checks for type-related linting errors
3. **CI Pipeline**: Runs comprehensive type checking in a clean environment

## Troubleshooting Common Issues

### "Property 'response' does not exist on type..."

The Relay compiler generates types with a structure like `{ response: { ... }, variables: { ... } }`. When using `useLazyLoadQuery`, you need to use the `response` property of the generated type:

```typescript
import type { MyQuery } from './__generated__/MyQuery.graphql';

const data = useLazyLoadQuery<MyQuery['response']>(query, variables);
```

### Import Paths Issues

If you encounter import errors with paths like `../__generated__/`, modify your `craco.config.js` to include:

```javascript
webpack: {
  configure: {
    resolve: {
      preferRelative: true
    }
  }
}
``` 