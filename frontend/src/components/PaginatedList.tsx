import React from 'react';
import { GraphQLTaggedNode } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button, Alert } from '@mui/material';

type Connection<T> = {
  edges: Array<{
    node: T;
    cursor: string;
  } | null> | null;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

type PaginatedListProps<T extends { id: string }> = {
  query: GraphQLTaggedNode;
  variables: Record<string, unknown>;
  connectionPath: string;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  title?: string;
};

// Separate component for data fetching that always uses the hook
function PaginatedListContent<T extends { id: string }>({
  query,
  variables,
  connectionPath,
  renderItem,
  emptyMessage,
  title,
  after,
  onLoadMore
}: PaginatedListProps<T> & { after: string | null, onLoadMore: (cursor: string | null) => void }): React.ReactElement {
  // Always call the hook at the top level
  const data = useLazyLoadQuery(
    query,
    { ...variables, after }
  ) as Record<string, unknown>;

  const connectionData = data[connectionPath] as unknown as Connection<T>;
  
  if (!connectionData || !connectionData.edges || connectionData.edges.length === 0) {
    return <Typography>{emptyMessage}</Typography>;
  }

  const items = connectionData.edges
    .filter(Boolean)
    .map(edge => edge?.node)
    .filter(Boolean) as T[];

  const loadMore = (): void => {
    if (connectionData?.pageInfo.hasNextPage) {
      onLoadMore(connectionData.pageInfo.endCursor);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{renderItem(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {connectionData?.pageInfo.hasNextPage && (
        <Button 
          variant="outlined" 
          onClick={loadMore} 
          sx={{ mt: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, title: string },
  { hasError: boolean, error: string | null }
> {
  constructor(props: { children: React.ReactNode, title: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean, error: string } {
    return {
      hasError: true,
      error: error.message
    };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>{this.props.title}</Typography>
          <Alert severity="error">Failed to load data: {this.state.error}</Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Main component that manages state and error handling
function PaginatedList<T extends { id: string }>(props: PaginatedListProps<T>): React.ReactElement {
  const [after, setAfter] = React.useState<string | null>(null);
  
  const handleLoadMore = (cursor: string | null): void => {
    setAfter(cursor);
  };

  return (
    <ErrorBoundary title={props.title || "Items"}>
      <PaginatedListContent
        {...props}
        after={after}
        onLoadMore={handleLoadMore}
      />
    </ErrorBoundary>
  );
}

export default PaginatedList; 