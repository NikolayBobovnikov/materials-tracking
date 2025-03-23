import React from 'react';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from './App';
import { renderWithProviders, mockReactRelay, mockClients, mockDebts, mockTransactions } from './utils/test-utils';

// Mock the GraphQL dependencies
mockReactRelay();

// Mock the components that use GraphQL
jest.mock('./components/InvoiceForm', () => () => <div data-testid="invoice-form">Mocked InvoiceForm</div>);
jest.mock('./components/ClientList', () => () => <div data-testid="client-list">Mocked ClientList</div>);
jest.mock('./components/DebtList', () => () => <div data-testid="debt-list">Mocked DebtList</div>);
jest.mock('./components/TransactionList', () => () => <div data-testid="transaction-list">Mocked TransactionList</div>);
jest.mock('./components/NodeViewer', () => () => <div data-testid="node-viewer">Mocked NodeViewer</div>);

describe('App Component', () => {
  test('renders app without crashing', () => {
    renderWithProviders(<App />);
    const appElement = screen.getByText(/Materials Tracking Module/i);
    expect(appElement).toBeInTheDocument();
  });

  test('renders all main components correctly', () => {
    renderWithProviders(<App />);
    
    // Check if all major components are rendered
    expect(screen.getByTestId('invoice-form')).toBeInTheDocument();
    expect(screen.getByTestId('client-list')).toBeInTheDocument();
    expect(screen.getByTestId('debt-list')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    expect(screen.getByTestId('node-viewer')).toBeInTheDocument();
  });

  test('renders appropriate section headings', () => {
    renderWithProviders(<App />);
    
    // Check for headings
    expect(screen.getByText(/Materials Tracking Module/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Invoice/i)).toBeInTheDocument();
  });

  test('has correct layout structure', () => {
    renderWithProviders(<App />);
    
    // Check that components are in correct containers
    const container = screen.getByText(/Materials Tracking Module/i).closest('div');
    expect(container).toBeInTheDocument();
    
    // Check for Grid structure (implementation-specific check)
    // This is checking for the MUI Grid structure
    const grids = document.querySelectorAll('.MuiGrid-container, .MuiGrid-item');
    expect(grids.length).toBeGreaterThan(0);
  });

  test('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders with mock data correctly', () => {
    // Overwrite the useLazyLoadQuery mock for this specific test
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      clients: mockClients,
      debts: mockDebts,
      transactions: mockTransactions
    }));
    
    renderWithProviders(<App />);
    expect(screen.getByText(/Materials Tracking Module/i)).toBeInTheDocument();
  });
});
