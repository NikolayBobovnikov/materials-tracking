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
// Import the specific type from the generated file
import { ClientListQuery as ClientListQueryType } from '../__generated__/ClientListQuery.graphql';

type ClientNodeType = {
  id: string;
  name: string;
  markup_rate: number;
};

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
  
  const data = useLazyLoadQuery<ClientListQueryType>(
    clientListQuery, 
    { first, after }
  );

  const loadMore = () => {
    if (data.clients?.pageInfo.hasNextPage) {
      setAfter(data.clients.pageInfo.endCursor);
    }
  };

  if (!data.clients || !data.clients.edges || data.clients.edges.length === 0) {
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
            {data.clients.edges.map(({ node }) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.name}</TableCell>
                <TableCell>{node.markup_rate}</TableCell>
              </TableRow>
            ))}
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