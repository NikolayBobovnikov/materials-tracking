import React from 'react';
import { graphql } from 'react-relay';
import { TableRow, TableCell } from '@mui/material';
import type { DebtListQuery } from './../__generated__/DebtListQuery.graphql';
import PaginatedList from './PaginatedList';

// Define the query
export const query = graphql`
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

// Define the node type
type DebtNode = {
  id: string;
  party: string;
  amount: number;
  created_date: string;
  invoice?: {
    id: string;
  };
};

const DebtList: React.FC = () => {
  return (
    <PaginatedList<DebtNode, DebtListQuery['response']>
      query={query}
      variables={{ first: 10 }}
      title="Debts"
      headers={["Debt ID", "Party", "Amount", "Created Date", "Invoice ID"]}
      connectionPath="debts"
      renderRow={(node) => (
        <TableRow key={node.id}>
          <TableCell>{node.id}</TableCell>
          <TableCell>{node.party}</TableCell>
          <TableCell>{node.amount}</TableCell>
          <TableCell>{node.created_date}</TableCell>
          <TableCell>{node.invoice?.id}</TableCell>
        </TableRow>
      )}
    />
  );
};

export default DebtList; 