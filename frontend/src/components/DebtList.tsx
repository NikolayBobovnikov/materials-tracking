import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { graphql } from 'react-relay';
import type { DebtListQuery$data } from '../__generated__/DebtListQuery.graphql';

// Use the imported query
export const DEBT_LIST_QUERY = graphql`
  query DebtListQuery($first: Int, $after: String) {
    debts(first: $first, after: $after) {
      edges {
        node {
          id
          party
          amount
          created_date
          invoice {
            id
          }
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

const DebtList: React.FC = () => {
  const [first, setFirst] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);

  const data = useLazyLoadQuery(DEBT_LIST_QUERY, { first, after });
  
  const typedData = data as unknown as DebtListQuery$data;

  const loadMore = () => {
    if (typedData.debts.pageInfo.hasNextPage) {
      setAfter(typedData.debts.pageInfo.endCursor);
    }
  };

  if (!typedData.debts || !typedData.debts.edges || typedData.debts.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Debts</Typography>
        <Typography>No debts found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Debts</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Debt ID</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Invoice ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {typedData.debts.edges.map((edge) => {
              if (!edge || !edge.node) return null;
              const node = edge.node;
              return (
                <TableRow key={node.id}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.party}</TableCell>
                  <TableCell>{node.amount}</TableCell>
                  <TableCell>{node.created_date}</TableCell>
                  <TableCell>{node.invoice?.id}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {typedData.debts.pageInfo.hasNextPage && (
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

export default DebtList; 