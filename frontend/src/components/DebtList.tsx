import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { graphql } from 'react-relay';

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

// Define the query response type
type DebtListQueryResponse = {
  debts: {
    edges: Array<{
      node: {
        id: string;
        party: string;
        amount: number;
        created_date: string;
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

const DebtList: React.FC = () => {
  const [first, setFirst] = React.useState(10);
  const [after, setAfter] = React.useState<string | null>(null);

  const data = useLazyLoadQuery<DebtListQueryResponse>(DEBT_LIST_QUERY, { first, after });

  const loadMore = () => {
    if (data.debts.pageInfo.hasNextPage) {
      setAfter(data.debts.pageInfo.endCursor);
    }
  };

  if (!data.debts || !data.debts.edges || data.debts.edges.length === 0) {
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
            {data.debts.edges.map(({ node }) => (
              <TableRow key={node.id}>
                <TableCell>{node.id}</TableCell>
                <TableCell>{node.party}</TableCell>
                <TableCell>{node.amount}</TableCell>
                <TableCell>{node.created_date}</TableCell>
                <TableCell>{node.invoice?.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.debts.pageInfo.hasNextPage && (
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