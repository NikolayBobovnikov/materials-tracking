import React from 'react';
import { render } from '@testing-library/react';
import ClientList from '../ClientList';
import { useLazyLoadQuery } from 'react-relay';
import type { ClientListQuery } from '../../__generated__/ClientListQuery.graphql';

// No need to mock the types - we import them directly

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
    // Mock the return value of useLazyLoadQuery with the actual type
    const mockData: ClientListQuery['response'] = {
      clients: {
        edges: [
          { 
            node: { id: '1', name: 'Test Client', markup_rate: 1.5 }, 
            cursor: 'cursor1' 
          }
        ],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    };
    
    (useLazyLoadQuery as jest.Mock).mockReturnValue(mockData);
    
    const { container } = render(<ClientList />);
    expect(container).toMatchSnapshot();
  });

  it('calls useLazyLoadQuery with correct parameters', () => {
    // Mock the return value with the actual type
    const mockData: ClientListQuery['response'] = {
      clients: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null }
      }
    };
    
    (useLazyLoadQuery as jest.Mock).mockReturnValue(mockData);
    
    render(<ClientList />);
    
    // Verify the hook was called with the expected parameter types
    expect(useLazyLoadQuery).toHaveBeenCalled();
    
    // The second argument should be an object with first and after properties
    const secondArg = (useLazyLoadQuery as jest.Mock).mock.calls[0][1] as ClientListQuery['variables'];
    expect(secondArg).toHaveProperty('first');
    expect(typeof secondArg.first).toBe('number');
    
    // Check that after property exists and is either null or a string
    expect(secondArg).toHaveProperty('after');
    // We use a variable and a simple assertion to avoid conditional expect
    const afterTypeIsValid = secondArg.after === null || typeof secondArg.after === 'string';
    expect(afterTypeIsValid).toBe(true);
  });
}); 