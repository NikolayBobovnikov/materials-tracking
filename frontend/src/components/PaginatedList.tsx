import React from 'react';
import { GraphQLTaggedNode } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';

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

function PaginatedList<T extends { id: string }>({
  query,
  variables,
  connectionPath,
  renderItem,
  emptyMessage = "No items found",
  title = "Items"
}: PaginatedListProps<T>): React.ReactElement {
  const [after, setAfter] = React.useState<string | null>(null);
  const allVariables = { ...variables, after };

  const data = useLazyLoadQuery(
    query,
    allVariables
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
      setAfter(connectionData.pageInfo.endCursor);
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

export default PaginatedList; 