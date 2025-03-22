import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Divider } from '@mui/material';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { toGlobalId } from '../RelayEnvironment';
import { NodeViewerQuery } from '../__generated__/NodeViewerQuery.graphql';

// Query to fetch node by its global ID
const NODE_QUERY = graphql`
  query NodeViewerQuery($id: ID!) {
    node(id: $id) {
      id
      ... on Client {
        name
        markup_rate
      }
      ... on Supplier {
        name
      }
      ... on MaterialsInvoice {
        base_amount
        invoice_date
        status
        client {
          id
          name
        }
        supplier {
          id
          name
        }
      }
    }
  }
`;

// Define a type that matches the actual structure of the data
type NodeData = {
  node: {
    id: string;
    name?: string;
    markup_rate?: number;
    base_amount?: number;
    invoice_date?: string;
    status?: string;
    client?: {
      id: string;
      name: string;
    };
    supplier?: {
      id: string;
      name: string;
    };
  } | null;
};

// Separate component for fetching data
const NodeDataDisplay: React.FC<{ id: string }> = ({ id }) => {
  const response = useLazyLoadQuery<NodeViewerQuery>(
    NODE_QUERY,
    { id }
  );
  
  // Cast the response to our expected type
  const data = response as unknown as NodeData;
  
  if (!data || !data.node) {
    return (
      <Typography color="error" sx={{ mb: 2 }}>
        No node found with ID: {id}
      </Typography>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Node Data:
      </Typography>
      <pre>
        {JSON.stringify(data.node, null, 2)}
      </pre>
    </Paper>
  );
};

const NodeViewer: React.FC = () => {
  const [nodeId, setNodeId] = useState('');
  const [nodeType, setNodeType] = useState('Client');
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  
  // Create a global ID using the function from RelayEnvironment
  const globalId = nodeId ? toGlobalId(nodeType, nodeId) : '';
  
  const handleFetchNode = (): void => {
    if (!globalId) return;
    setFetchedId(globalId);
  };
  
  const resetForm = (): void => {
    setNodeId('');
    setNodeType('Client');
    setFetchedId(null);
  };
  
  return (
    <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Node Interface Demo
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Node Type"
          value={nodeType}
          onChange={(e) => {
            setNodeType(e.target.value);
            setFetchedId(null);
          }}
          SelectProps={{
            native: true,
          }}
          sx={{ width: '150px' }}
        >
          <option value="Client">Client</option>
          <option value="Supplier">Supplier</option>
          <option value="MaterialsInvoice">Invoice</option>
          <option value="Transaction">Transaction</option>
          <option value="Debt">Debt</option>
        </TextField>
        
        <TextField
          label="ID"
          value={nodeId}
          onChange={(e) => {
            setNodeId(e.target.value);
            setFetchedId(null);
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <Button 
          variant="contained" 
          onClick={handleFetchNode}
          disabled={!nodeId}
        >
          Fetch Node
        </Button>
        
        {fetchedId && (
          <Button 
            variant="outlined" 
            onClick={resetForm}
          >
            Reset
          </Button>
        )}
      </Box>
      
      {globalId && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Global ID: <code>{globalId}</code>
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {fetchedId && <NodeDataDisplay id={fetchedId} />}
    </Box>
  );
};

export default NodeViewer; 