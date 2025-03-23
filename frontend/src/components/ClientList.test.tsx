import React from 'react';
import { screen } from '@testing-library/react';
import ClientList from './ClientList';
import { renderWithProviders, mockReactRelay, mockClients } from '../utils/test-utils';

// Mock react-relay
mockReactRelay();

// Mock the PaginatedList component
jest.mock('./PaginatedList', () => {
  return function MockedPaginatedList(props: any) {
    return (
      <div data-testid="paginated-list">
        <h3>{props.title}</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Markup Rate</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.edges.map(({ node }) => (
              <tr key={node.id} data-testid="client-row">
                <td>{props.renderItem(node)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
});

describe('ClientList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithProviders(<ClientList />);
    expect(screen.getByTestId('paginated-list')).toBeInTheDocument();
  });

  test('renders with correct title', () => {
    renderWithProviders(<ClientList />);
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  test('passes correct props to PaginatedList', () => {
    // Create a spy to check the props
    const PaginatedListSpy = jest.spyOn(require('./PaginatedList'), 'default');
    
    renderWithProviders(<ClientList />);
    
    // Check if PaginatedList was called with correct props
    expect(PaginatedListSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Clients',
        variables: { first: 10 },
        connectionPath: 'clients',
      }),
      expect.anything()
    );
  });

  test('renders client data correctly', () => {
    renderWithProviders(<ClientList />);
    
    // Check if the component renders client rows
    const clientRows = screen.getAllByTestId('client-row');
    expect(clientRows.length).toBe(mockClients.edges.length);
  });
}); 