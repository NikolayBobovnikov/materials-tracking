import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  Box,
  Button
} from '@mui/material';
import type { ClientListQuery$data } from '../__generated__/ClientListQuery.graphql';

// Define our query
const clientListQuery = graphql`
  query ClientListQuery($first: Int, $after: String) {
    clients(first: $first, after: $after) {
      edges {
        node {
          id
          name
          markup_rate
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

const ClientList: React.FC = () => {
  const [first, setFirst] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);
  
  const data = useLazyLoadQuery(
    clientListQuery, 
    { first, after }
  );

  const typedData = data as unknown as ClientListQuery$data;

  const loadMore = () => {
    if (typedData.clients?.pageInfo.hasNextPage) {
      setAfter(typedData.clients.pageInfo.endCursor);
    }
  };

  if (!typedData.clients || !typedData.clients.edges || typedData.clients.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Clients</Typography>
        <Typography>No clients found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Clients</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Markup Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {typedData.clients.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              const node = edge.node;
              return (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>{node.markup_rate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {typedData.clients.pageInfo.hasNextPage && (
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

export default ClientList; 