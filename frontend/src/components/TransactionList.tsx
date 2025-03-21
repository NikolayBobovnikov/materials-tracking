import React from 'react';
import { graphql } from 'react-relay';
import { TableRow, TableCell } from '@mui/material';
import type { TransactionListQuery } from './../__generated__/TransactionListQuery.graphql';
import PaginatedList from './PaginatedList';

// Define the query
export const query = graphql`
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

// Define the node type
type TransactionNode = {
  id: string;
  amount: number;
  transaction_date: string;
  invoice?: {
    id: string;
  };
};

const TransactionList: React.FC = () => {
  return (
    <PaginatedList<TransactionNode, TransactionListQuery['response']>
      query={query}
      variables={{ first: 10 }}
      title="Transactions"
      headers={["Transaction ID", "Amount", "Transaction Date", "Invoice ID"]}
      connectionPath="transactions"
      renderRow={(node) => (
        <TableRow key={node.id}>
          <TableCell>{node.id}</TableCell>
          <TableCell>{node.amount}</TableCell>
          <TableCell>{node.transaction_date}</TableCell>
          <TableCell>{node.invoice?.id}</TableCell>
        </TableRow>
      )}
    />
  );
};

export default TransactionList; 