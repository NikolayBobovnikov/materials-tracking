import React from 'react';
import { graphql } from 'react-relay';
import { TableCell } from '@mui/material';
import PaginatedList from './PaginatedList';

// Define the query
const query = graphql`
  query TransactionListQuery($first: Int, $after: String) {
    transactions(first: $first, after: $after) {
      edges {
        node {
          id
          amount
          transaction_date
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

// Define the node type
type TransactionNode = {
  id: string;
  amount: number;
  transaction_date: string;
};

const TransactionList: React.FC = () => {
  return (
    <PaginatedList<TransactionNode>
      query={query}
      variables={{ first: 10 }}
      title="Transactions"
      connectionPath="transactions"
      renderItem={(node): JSX.Element => (
        <>
          <TableCell>{node.id}</TableCell>
          <TableCell>${node.amount.toFixed(2)}</TableCell>
          <TableCell>{new Date(node.transaction_date).toLocaleDateString()}</TableCell>
        </>
      )}
    />
  );
};

export default TransactionList; 