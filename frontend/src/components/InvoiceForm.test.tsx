import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import InvoiceForm from './InvoiceForm';
import { renderWithProviders, mockReactRelay } from '../utils/test-utils';
import { graphql } from 'react-relay';

// Mock react-relay
mockReactRelay();

// Create specific mock data for InvoiceForm tests
const mockClientsSuppliers = {
  clients: {
    edges: [
      {
        node: {
          id: 'client-id-1',
          name: 'Client 1',
          __typename: 'Client',
        },
        cursor: 'cursor1',
      },
      {
        node: {
          id: 'client-id-2',
          name: 'Client 2',
          __typename: 'Client',
        },
        cursor: 'cursor2',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'cursor2',
    },
  },
  suppliers: {
    edges: [
      {
        node: {
          id: 'supplier-id-1',
          name: 'Supplier 1',
          __typename: 'Supplier',
        },
        cursor: 'supplier-cursor1',
      },
      {
        node: {
          id: 'supplier-id-2',
          name: 'Supplier 2',
          __typename: 'Supplier',
        },
        cursor: 'supplier-cursor2',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'supplier-cursor2',
    },
  },
};

// Mock the useLazyLoadQuery specifically for this component
jest.mock('react-relay', () => {
  const originalModule = jest.requireActual('react-relay');
  return {
    ...originalModule,
    useLazyLoadQuery: jest.fn(() => mockClientsSuppliers),
    graphql: jest.fn(() => ({})),
  };
});

// Mock the form reset functionality
jest.mock('../RelayEnvironment', () => ({
  resetRelayEnvironment: jest.fn(),
}));

describe('InvoiceForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithProviders(<InvoiceForm />);
    expect(screen.getByText(/Create Materials Invoice/i)).toBeInTheDocument();
  });

  test('renders all form fields correctly', () => {
    renderWithProviders(<InvoiceForm />);
    
    // Check form fields
    expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supplier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Invoice Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  test('should populate dropdown options from query data', async () => {
    renderWithProviders(<InvoiceForm />);
    
    // Open client dropdown
    const clientSelect = screen.getByLabelText(/Client/i);
    await userEvent.click(clientSelect);
    
    // Client options should be visible
    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
      expect(screen.getByText('Client 2')).toBeInTheDocument();
    });
  });

  test('should validate form fields', async () => {
    const { user } = renderWithProviders(<InvoiceForm />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Client is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Supplier is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Invoice date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
    });
  });

  test('should handle form submission correctly', async () => {
    // Mock useMutation
    const mockCommitMutation = jest.fn().mockImplementation((_, variables) => {
      return Promise.resolve({
        createMaterialsInvoice: {
          invoice: {
            id: 'new-invoice-id',
            client: { id: variables.clientId, name: 'Client 1' },
            supplier: { id: variables.supplierId, name: 'Supplier 1' },
            invoice_date: variables.invoiceDate,
            base_amount: variables.baseAmount,
            status: 'PENDING',
          },
          errors: null,
        },
      });
    });
    
    jest.spyOn(require('react-relay/hooks'), 'useMutation').mockImplementation(() => [
      mockCommitMutation,
      false, // loading state
    ]);
    
    const { user } = renderWithProviders(<InvoiceForm />);
    
    // Fill form fields
    const clientSelect = screen.getByLabelText(/Client/i);
    await user.click(clientSelect);
    await user.click(screen.getByText('Client 1'));
    
    const supplierSelect = screen.getByLabelText(/Supplier/i);
    await user.click(supplierSelect);
    await user.click(screen.getByText('Supplier 1'));
    
    const dateInput = screen.getByLabelText(/Invoice Date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2023-04-15');
    
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '100.50');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Check if mutation was called with correct variables
    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledTimes(1);
      expect(mockCommitMutation.mock.calls[0][1]).toMatchObject({
        clientId: 'client-id-1',
        supplierId: 'supplier-id-1',
        invoiceDate: '2023-04-15',
        baseAmount: 100.5,
      });
    });
  });

  test('should handle API errors correctly', async () => {
    // Mock useMutation to return an error
    const mockCommitMutation = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        createMaterialsInvoice: {
          invoice: null,
          errors: ['Invalid client ID', 'Amount must be positive'],
        },
      });
    });
    
    jest.spyOn(require('react-relay/hooks'), 'useMutation').mockImplementation(() => [
      mockCommitMutation,
      false, // loading state
    ]);
    
    const { user } = renderWithProviders(<InvoiceForm />);
    
    // Fill form fields (minimally to pass client-side validation)
    const clientSelect = screen.getByLabelText(/Client/i);
    await user.click(clientSelect);
    await user.click(screen.getByText('Client 1'));
    
    const supplierSelect = screen.getByLabelText(/Supplier/i);
    await user.click(supplierSelect);
    await user.click(screen.getByText('Supplier 1'));
    
    const dateInput = screen.getByLabelText(/Invoice Date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2023-04-15');
    
    const amountInput = screen.getByLabelText(/Amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '-50');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitButton);
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid client ID/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount must be positive/i)).toBeInTheDocument();
    });
  });

  test('should display loading state during submission', async () => {
    // Mock loading state
    jest.spyOn(require('react-relay/hooks'), 'useMutation').mockImplementation(() => [
      jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))),
      true, // loading state
    ]);
    
    renderWithProviders(<InvoiceForm />);
    
    // Loading indicator should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled();
  });

  test('should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<InvoiceForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 