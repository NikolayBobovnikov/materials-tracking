import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Divider } from '@mui/material';
import { toGlobalId } from '../RelayEnvironment';

interface NodeData {
  id: string;
  [key: string]: unknown;
}

const NodeViewer: React.FC = () => {
  const [nodeId, setNodeId] = useState('');
  const [nodeType, setNodeType] = useState('Client');
  const [fetchedData, setFetchedData] = useState<NodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const globalId = nodeId ? toGlobalId(nodeType, nodeId) : '';
  
  const handleFetchNode = async (): Promise<void> => {
    if (!globalId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              node(id: "${globalId}") {
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
                  status
                  invoice_date
                }
                ... on Transaction {
                  amount
                  transaction_date
                }
                ... on Debt {
                  party
                  amount
                  created_date
                }
              }
            }
          `
        }),
      });
      
      const result = await response.json();
      
      if (result.errors) {
        setError(result.errors[0].message);
        setFetchedData(null);
      } else if (result.data && result.data.node) {
        setFetchedData(result.data.node);
      } else {
        setError(`No node found with ID: ${globalId}`);
        setFetchedData(null);
      }
    } catch (err) {
      setError('Error fetching data: ' + (err instanceof Error ? err.message : String(err)));
      setFetchedData(null);
    } finally {
      setLoading(false);
    }
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
          onChange={(e) => setNodeType(e.target.value)}
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
          onChange={(e) => setNodeId(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        
        <Button 
          variant="contained" 
          onClick={handleFetchNode}
          disabled={!nodeId || loading}
        >
          {loading ? 'Loading...' : 'Fetch Node'}
        </Button>
      </Box>
      
      {globalId && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Global ID: <code>{globalId}</code>
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {fetchedData && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Node Data:
          </Typography>
          <pre>
            {JSON.stringify(fetchedData, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default NodeViewer; 