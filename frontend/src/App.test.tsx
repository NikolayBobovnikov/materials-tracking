import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the GraphQL dependencies
jest.mock('react-relay', () => ({
  useRelayEnvironment: jest.fn(),
  RelayEnvironmentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  graphql: jest.fn(() => ({})),
  useLazyLoadQuery: jest.fn(() => ({
    allClients: { edges: [] },
    allSuppliers: { edges: [] }
  }))
}));

// Mock the components that use GraphQL
jest.mock('./components/InvoiceForm', () => () => <div>Mocked InvoiceForm</div>);
jest.mock('./components/DebtList', () => () => <div>Mocked DebtList</div>);
jest.mock('./components/TransactionList', () => () => <div>Mocked TransactionList</div>);

test('renders app without crashing', () => {
  render(<App />);
  const appElement = screen.getByText(/Materials Tracking Module/i);
  expect(appElement).toBeInTheDocument();
});
