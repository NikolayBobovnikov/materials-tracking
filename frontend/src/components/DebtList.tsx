import React from 'react';
import { graphql } from 'react-relay';
import { TableCell } from '@mui/material';
import PaginatedList from './PaginatedList';

// Define the query
const query = graphql`
  query DebtListQuery($first: Int, $after: String) {
    debts(first: $first, after: $after) {
      edges {
        node {
          id
          party
          amount
          created_date
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
};

const DebtList: React.FC = () => {
  return (
    <PaginatedList<DebtNode>
      query={query}
      variables={{ first: 10 }}
      title="Debts"
      connectionPath="debts"
      renderItem={(node): JSX.Element => (
        <>
          <TableCell>{node.id}</TableCell>
          <TableCell>{node.party}</TableCell>
          <TableCell>${node.amount.toFixed(2)}</TableCell>
          <TableCell>{new Date(node.created_date).toLocaleDateString()}</TableCell>
        </>
      )}
    />
  );
};

export default DebtList; 