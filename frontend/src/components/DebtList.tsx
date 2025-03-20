import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import { graphql } from 'react-relay';

// Use the imported query
export const DEBT_LIST_QUERY = graphql`
  query DebtListQuery {
    allDebts(first: 50) {
      edges {
        node {
          id
          party
          amount
          createdDate
          invoice {
            id
          }
        }
      }
    }
  }
`;

type DebtListQuery = {
  allDebts: {
    edges: Array<{
      node: {
        id: string;
        party: string;
        amount: number;
        createdDate: string;
        invoice: {
          id: string;
        } | null;
      };
    }>;
  };
};

const DebtList: React.FC = () => {
  const data = useLazyLoadQuery<DebtListQuery>(DEBT_LIST_QUERY, {});

  if (!data.allDebts || data.allDebts.edges.length === 0) {
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
              <TableCell>Invoice ID</TableCell>
              <TableCell>Created Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.allDebts.edges.map(({ node }) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.party}</TableCell>
                <TableCell>{node.amount}</TableCell>
                <TableCell>{node.invoice?.id}</TableCell>
                <TableCell>{node.createdDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DebtList; 