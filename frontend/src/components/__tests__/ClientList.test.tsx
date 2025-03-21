import React from 'react';
import { render } from '@testing-library/react';
import ClientList from '../ClientList';
import { useLazyLoadQuery } from 'react-relay';

// Mock the generated type structure
jest.mock('../../__generated__/ClientListQuery.graphql', () => ({
  ClientListQuery: {
    response: {
      clients: {
        edges: [
          {
            node: { id: '1', name: 'Test Client', markup_rate: 1.5 },
            cursor: 'cursor1'
          }
        ],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    }
  }
}));

// Mock relay hooks
jest.mock('react-relay', () => ({
  useLazyLoadQuery: jest.fn(),
  graphql: jest.fn()
}));

describe('ClientList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles Relay data correctly', () => {
    // Mock the return value of useLazyLoadQuery
    (useLazyLoadQuery as jest.Mock).mockReturnValue({
      clients: {
        edges: [
          { node: { id: '1', name: 'Test Client', markup_rate: 1.5 }, cursor: 'cursor1' }
        ],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    });
    
    const { container } = render(<ClientList />);
    expect(container).toMatchSnapshot();
  });

  it('calls useLazyLoadQuery with correct parameters', () => {
    // Mock the return value
    (useLazyLoadQuery as jest.Mock).mockReturnValue({
      clients: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    });
    
    render(<ClientList />);
    
    // Verify the hook was called with the expected parameter types
    expect(useLazyLoadQuery).toHaveBeenCalled();
    
    // The second argument should be an object with first and after properties
    const secondArg = (useLazyLoadQuery as jest.Mock).mock.calls[0][1];
    expect(secondArg).toHaveProperty('first');
    expect(typeof secondArg.first).toBe('number');
    
    // Check that after property exists and is either null or a string
    expect(secondArg).toHaveProperty('after');
    // We use a variable and a simple assertion to avoid conditional expect
    const afterTypeIsValid = secondArg.after === null || typeof secondArg.after === 'string';
    expect(afterTypeIsValid).toBe(true);
  });
}); 