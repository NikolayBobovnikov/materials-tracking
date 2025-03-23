import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import PaginatedList from './PaginatedList';
import { renderWithProviders, mockReactRelay } from '../utils/test-utils';
import { graphql } from 'react-relay';

// Mock react-relay
mockReactRelay();

// Create test data
type TestItem = {
  id: string;
  name: string;
  value: number;
};

const testConnection = {
  edges: [
    {
      node: {
        id: 'item-1',
        name: 'Test Item 1',
        value: 100,
      },
      cursor: 'cursor1'
    },
    {
      node: {
        id: 'item-2',
        name: 'Test Item 2',
        value: 200,
      },
      cursor: 'cursor2'
    }
  ],
  pageInfo: {
    hasNextPage: true,
    endCursor: 'cursor2'
  }
};

const testConnectionWithoutNextPage = {
  ...testConnection,
  pageInfo: {
    hasNextPage: false,
    endCursor: 'cursor2'
  }
};

const emptyConnection = {
  edges: [],
  pageInfo: {
    hasNextPage: false,
    endCursor: null
  }
};

// Create test query
const testQuery = graphql`
  query PaginatedListTestQuery($first: Int, $after: String) {
    items(first: $first, after: $after) {
      edges {
        node {
          id
          name
          value
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Mock test render function
const testRenderItem = (item: TestItem) => (
  <div data-testid={`item-${item.id}`}>
    <span>{item.name}</span>
    <span>{item.value}</span>
  </div>
);

describe('PaginatedList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    // Mock useLazyLoadQuery to return test data
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: testConnection
    }));

    renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    expect(screen.getByText('Test Items')).toBeInTheDocument();
  });

  test('renders items correctly', () => {
    // Mock useLazyLoadQuery to return test data
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: testConnection
    }));

    renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    // Check if items are rendered
    expect(screen.getByTestId('item-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-item-2')).toBeInTheDocument();
  });

  test('shows "Load More" button when hasNextPage is true', () => {
    // Mock useLazyLoadQuery to return test data with next page
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: testConnection
    }));

    renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    // Check if "Load More" button is rendered
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument();
  });

  test('does not show "Load More" button when hasNextPage is false', () => {
    // Mock useLazyLoadQuery to return test data without next page
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: testConnectionWithoutNextPage
    }));

    renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    // Check that "Load More" button is not rendered
    expect(screen.queryByRole('button', { name: /Load More/i })).not.toBeInTheDocument();
  });

  test('handles empty data correctly', () => {
    // Mock useLazyLoadQuery to return empty data
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: emptyConnection
    }));

    renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
        emptyMessage="No test items found"
      />
    );

    // Check if empty message is rendered
    expect(screen.getByText('No test items found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('handles "Load More" button click correctly', async () => {
    // Create mock implementations that will be used in sequence
    const useLazyLoadQueryMock = jest.spyOn(require('react-relay'), 'useLazyLoadQuery');
    
    // First call returns initial data
    useLazyLoadQueryMock.mockImplementationOnce(() => ({
      items: testConnection
    }));
    
    // Second call (after state update) returns new data
    useLazyLoadQueryMock.mockImplementationOnce(() => ({
      items: {
        edges: [
          ...testConnection.edges,
          {
            node: {
              id: 'item-3',
              name: 'Test Item 3',
              value: 300,
            },
            cursor: 'cursor3'
          }
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor3'
        }
      }
    }));

    const { user } = renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    // Click "Load More" button
    const loadMoreButton = screen.getByRole('button', { name: /Load More/i });
    await user.click(loadMoreButton);

    // Check that the mock was called with updated variables
    await waitFor(() => {
      expect(useLazyLoadQueryMock).toHaveBeenCalledTimes(2);
      expect(useLazyLoadQueryMock).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ after: 'cursor2' })
      );
    });
  });

  test('should not have accessibility violations', async () => {
    // Mock useLazyLoadQuery to return test data
    jest.spyOn(require('react-relay'), 'useLazyLoadQuery').mockImplementation(() => ({
      items: testConnection
    }));

    const { container } = renderWithProviders(
      <PaginatedList<TestItem>
        query={testQuery}
        variables={{ first: 10 }}
        connectionPath="items"
        renderItem={testRenderItem}
        title="Test Items"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 