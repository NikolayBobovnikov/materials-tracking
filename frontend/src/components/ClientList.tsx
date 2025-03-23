import React from 'react';
import { graphql } from 'react-relay';
import { TableCell } from '@mui/material';
import PaginatedList from './PaginatedList';

// Define the query
const query = graphql`
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

// Define the node type
type ClientNode = {
  id: string;
  name: string;
  markup_rate: number;
};

const ClientList: React.FC = () => {
  return (
    <PaginatedList<ClientNode>
      query={query}
      variables={{ first: 10 }}
      title="Clients"
      connectionPath="clients"
      renderItem={(node): JSX.Element => (
        <>
          <TableCell>{node.id}</TableCell>
          <TableCell>{node.name}</TableCell>
          <TableCell>{node.markup_rate}</TableCell>
        </>
      )}
    />
  );
};

export default ClientList; 