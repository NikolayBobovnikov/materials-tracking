import React from 'react';
import { graphql } from 'react-relay';
import { TableRow, TableCell } from '@mui/material';
import type { ClientListQuery } from './../__generated__/ClientListQuery.graphql';
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
    <PaginatedList<ClientNode, ClientListQuery['response']>
      query={query}
      variables={{ first: 10 }}
      title="Clients"
      headers={["ID", "Name", "Markup Rate"]}
      connectionPath="clients"
      renderRow={(node) => (
        <TableRow key={node.id}>
          <TableCell>{node.id}</TableCell>
          <TableCell>{node.name}</TableCell>
          <TableCell>{node.markup_rate}</TableCell>
        </TableRow>
      )}
    />
  );
};

export default ClientList; 