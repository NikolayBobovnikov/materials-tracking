import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import { graphql } from 'react-relay';

// Use the imported query
export const TRANSACTION_LIST_QUERY = graphql`
  query TransactionListQuery {
    allTransactions(first: 50) {
      edges {
        node {
          id
          amount
          transactionDate
          invoice {
            id
          }
        }
      }
    }
  }
`;

type TransactionListQuery = {
  allTransactions: {
    edges: Array<{
      node: {
        id: string;
        amount: number;
        transactionDate: string;
        invoice: {
          id: string;
        } | null;
      };
    }>;
  };
};

const TransactionList: React.FC = () => {
  const data = useLazyLoadQuery<TransactionListQuery>(TRANSACTION_LIST_QUERY, {});

  if (!data.allTransactions || data.allTransactions.edges.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Transactions</Typography>
        <Typography>No transactions found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Transactions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Transaction Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.allTransactions.edges.map(({ node }) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.amount}</TableCell>
                <TableCell>{node.invoice?.id}</TableCell>
                <TableCell>{node.transactionDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionList; 