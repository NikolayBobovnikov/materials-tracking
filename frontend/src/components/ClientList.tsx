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
import type { ClientListQuery } from './../__generated__/ClientListQuery.graphql';
import { ResponseType } from '../utils/types';
import { validateRelayData, validateRelayConnection } from '../utils/dataValidator';

// Define our query
const query = graphql`
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
  const [first] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);
  
  const data = useLazyLoadQuery<ResponseType<ClientListQuery>>(
    query, 
    { first, after }
  );

  // Validate data structure at runtime
  validateRelayData(data, 'ClientList');
  const clientsValid = validateRelayConnection(data.clients, 'clients', 'ClientList');

  const loadMore = (): void => {
    if (data.clients?.pageInfo.hasNextPage) {
      setAfter(data.clients.pageInfo.endCursor);
    }
  };

  if (!clientsValid || !data.clients || !data.clients.edges || data.clients.edges.length === 0) {
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
            {data.clients.edges.map((edge) => {
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
      
      {data.clients.pageInfo.hasNextPage && (
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