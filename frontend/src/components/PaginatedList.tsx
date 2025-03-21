import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import type { GraphQLTaggedNode } from 'relay-runtime';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

type Edge<T> = {
  node: T;
  cursor: string;
} | null;

type Connection<T> = {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
};

type PaginatedListProps<T, QueryResponse> = {
  query: GraphQLTaggedNode; // Properly typed GraphQL query
  variables: { first: number; after?: string | null };
  title: string;
  headers: string[];
  renderRow: (node: T) => React.ReactNode;
  connectionPath: keyof QueryResponse; // Path to the connection in the query response (e.g., "clients", "transactions")
  emptyMessage?: string;
};

const PaginatedList = <T, QueryResponse extends Record<string, unknown>>({
  query,
  variables,
  title,
  headers,
  renderRow,
  connectionPath,
  emptyMessage
}: PaginatedListProps<T, QueryResponse>): React.ReactElement => {
  const [first] = React.useState(variables.first || 10);
  const [after, setAfter] = React.useState<string | null>(variables.after || null);

  const data = useLazyLoadQuery<QueryResponse>(
    query,
    { first, after }
  );

  // Get the connection from the response using the connectionPath
  const connection = data[connectionPath] as unknown as Connection<T>;

  const loadMore = (): void => {
    if (connection?.pageInfo.hasNextPage) {
      setAfter(connection.pageInfo.endCursor);
    }
  };

  if (!connection?.edges?.length) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography>{emptyMessage || `No ${title.toLowerCase()} found.`}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {connection.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              return renderRow(edge.node);
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {connection.pageInfo.hasNextPage && (
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
};

export default PaginatedList; 