import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { graphql } from 'react-relay';

// Use the imported query
export const TRANSACTION_LIST_QUERY = graphql`
  query TransactionListQuery($first: Int, $after: String) {
    transactions(first: $first, after: $after) {
      edges {
        node {
          id
          amount
          transaction_date
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

// Define the query response type
type TransactionListQueryResponse = {
  transactions: {
    edges: Array<{
      node: {
        id: string;
        amount: number;
        transaction_date: string;
        invoice: {
          id: string;
        } | null;
      };
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

const TransactionList: React.FC = () => {
  const [first, setFirst] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);

  const data = useLazyLoadQuery<TransactionListQueryResponse>(TRANSACTION_LIST_QUERY, { first, after });

  const loadMore = () => {
    if (data.transactions.pageInfo.hasNextPage) {
      setAfter(data.transactions.pageInfo.endCursor);
    }
  };

  if (!data.transactions || !data.transactions.edges || data.transactions.edges.length === 0) {
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
              <TableCell>Transaction Date</TableCell>
              <TableCell>Invoice ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.transactions.edges.map(({ node }) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.amount}</TableCell>
                <TableCell>{node.transaction_date}</TableCell>
                <TableCell>{node.invoice?.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.transactions.pageInfo.hasNextPage && (
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

export default TransactionList; 