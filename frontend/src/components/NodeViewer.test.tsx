import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NodeViewer from './NodeViewer';
import * as RelayEnvironment from '../RelayEnvironment';

// Mock the environment utilities
jest.spyOn(RelayEnvironment, 'toGlobalId').mockImplementation((type, id) => `${type}:${id}`);

// Mock fetch for testing the API call
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({
      data: {
        node: {
          id: 'Client:123',
          name: 'Test Client',
          markup_rate: 1.5
        }
      }
    })
  })
) as jest.Mock;

describe('NodeViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<NodeViewer />);
    expect(screen.getByText('Node Interface Demo')).toBeInTheDocument();
    expect(screen.getByLabelText('Node Type')).toBeInTheDocument();
    expect(screen.getByLabelText('ID')).toBeInTheDocument();
  });

  it('enables the fetch button when ID is entered', () => {
    render(<NodeViewer />);
    const button = screen.getByText('Fetch Node');
    expect(button).toBeDisabled();
    
    const idInput = screen.getByLabelText('ID');
    fireEvent.change(idInput, { target: { value: '123' }});
    expect(button).not.toBeDisabled();
  });

  it('fetches node data when button is clicked', async () => {
    render(<NodeViewer />);
    
    // Enter an ID
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: '123' }});
    
    // Click the fetch button
    fireEvent.click(screen.getByText('Fetch Node'));
    
    // Wait for data to be fetched (the button text changes during loading)
    await waitFor(() => {
      expect(screen.getByText('Node Data:')).toBeInTheDocument();
    });
    
    // Verify the fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/graphql', expect.any(Object));
  });
}); 