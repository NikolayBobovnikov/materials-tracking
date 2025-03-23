import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayEnvironmentProvider } from 'react-relay';

// Common mock data for tests
export const mockClients = {
  edges: [
    {
      node: {
        id: 'client-1',
        name: 'Test Client 1',
        __typename: 'Client',
      },
    },
    {
      node: {
        id: 'client-2',
        name: 'Test Client 2',
        __typename: 'Client',
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: null,
  },
};

export const mockDebts = {
  edges: [
    {
      node: {
        id: 'debt-1',
        amount: 100,
        description: 'Test Debt 1',
        clientId: 'client-1',
        __typename: 'Debt',
      },
    },
    {
      node: {
        id: 'debt-2',
        amount: 200,
        description: 'Test Debt 2',
        clientId: 'client-2',
        __typename: 'Debt',
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: null,
  },
};

export const mockTransactions = {
  edges: [
    {
      node: {
        id: 'transaction-1',
        amount: 50,
        description: 'Test Transaction 1',
        clientId: 'client-1',
        __typename: 'Transaction',
      },
    },
    {
      node: {
        id: 'transaction-2',
        amount: 75,
        description: 'Test Transaction 2',
        clientId: 'client-2',
        __typename: 'Transaction',
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: null,
  },
};

// Create a mock Relay environment
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
const createMockEnvironment = () => {
  return {
    retain: jest.fn(),
    lookup: jest.fn(),
    check: jest.fn(),
    subscribe: jest.fn(),
    getStore: jest.fn(),
    execute: jest.fn(),
    applyUpdate: jest.fn(),
    replayOperation: jest.fn(),
    replaceOperation: jest.fn(),
    options: {},
    applyMutation: jest.fn(),
    commitUpdate: jest.fn(),
    commitPayload: jest.fn(),
    isServer: false,
    isRequestActive: jest.fn(() => false),
    isActive: jest.fn(() => true),
    request: jest.fn(() => ({ dispose: jest.fn() })),
    executeMutation: jest.fn(() => Promise.resolve()),
    commitLocalUpdate: jest.fn(),
    getNetwork: jest.fn(),
    getOperationTracker: jest.fn(),
    executeWithSource: jest.fn(),
    requiredFieldLogger: jest.fn(),
    getDataID: jest.fn(() => ''),
    isStringIntDuringModernization: jest.fn(() => false)
  } as any; // Type assertion to avoid type errors
};
/* eslint-enable @typescript-eslint/explicit-function-return-type */
/* eslint-enable @typescript-eslint/no-explicit-any */

// Custom renderer with wrapped providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  relayEnvironment?: ReturnType<typeof createMockEnvironment>;
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export function renderWithProviders(
  ui: ReactElement,
  { 
    relayEnvironment = createMockEnvironment(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        {children}
      </RelayEnvironmentProvider>
    );
  };

  return {
    user: userEvent.setup(),
    relayEnvironment,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Common mock for react-relay
export const mockReactRelay = () => {
  jest.mock('react-relay', () => ({
    useRelayEnvironment: jest.fn(),
    RelayEnvironmentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    graphql: jest.fn(() => ({})),
    useLazyLoadQuery: jest.fn(() => ({
      clients: mockClients,
      debts: mockDebts,
      transactions: mockTransactions
    })),
    useMutation: jest.fn(([mutation, callback]) => {
      return [
        jest.fn().mockImplementation((input) => {
          // Mock a successful mutation
          if (callback && callback.onCompleted) {
            callback.onCompleted({}, null);
          }
          return { dispose: jest.fn() };
        }),
        false, // loading state
      ];
    }),
    usePreloadedQuery: jest.fn(() => ({
      clients: mockClients,
      debts: mockDebts,
      transactions: mockTransactions
    })),
    useFragment: jest.fn(() => ({
      id: 'mock-id',
      name: 'Mock Name',
    })),
    usePaginationFragment: jest.fn(() => ({
      data: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null }
      },
      loadNext: jest.fn(),
      isLoadingNext: false,
      hasNext: false,
      refetch: jest.fn(),
    })),
  }));
}; 