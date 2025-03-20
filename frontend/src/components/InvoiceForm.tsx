import React from 'react';
import { TextField, Button, Box, CircularProgress, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { createInvoice, CreateMaterialsInvoiceMutationResponse } from '../mutations/CreateMaterialsInvoice';
import { useRelayEnvironment } from 'react-relay';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Add type definitions for the query response
type ClientNode = {
  id: string;
  name: string;
};

type SupplierNode = {
  id: string;
  name: string;
};

type QueryResponse = {
  clients: {
    edges: Array<{
      node: ClientNode;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
  suppliers: {
    edges: Array<{
      node: SupplierNode;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

const ALL_CLIENTS_SUPPLIERS_QUERY = graphql`
  query InvoiceFormClientsSuppliersQuery($clientsFirst: Int, $suppliersFirst: Int) {
    clients(first: $clientsFirst) {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    suppliers(first: $suppliersFirst) {
      edges {
        node {
          id
          name
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

type InvoiceFormInputs = {
  clientGlobalId: string;
  supplierGlobalId: string;
  invoiceDate: string;
  baseAmount: number;
};

const InvoiceForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceFormInputs>();
  const environment = useRelayEnvironment();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Load clients and suppliers data
  const queryData = useLazyLoadQuery<QueryResponse>(
    ALL_CLIENTS_SUPPLIERS_QUERY, 
    { clientsFirst: 50, suppliersFirst: 50 }
  );
  const clientsList = queryData.clients?.edges.map((e: {node: ClientNode; cursor: string}) => e.node) || [];
  const suppliersList = queryData.suppliers?.edges.map((e: {node: SupplierNode; cursor: string}) => e.node) || [];

  const onSubmit = async (formData: InvoiceFormInputs) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    createInvoice(
      environment,
      {
        clientId: formData.clientGlobalId,
        supplierId: formData.supplierGlobalId,
        invoiceDate: formData.invoiceDate,
        baseAmount: parseFloat(formData.baseAmount.toString()),
      },
      (resp: CreateMaterialsInvoiceMutationResponse) => {
        setLoading(false);
        
        if (resp.createMaterialsInvoice.errors && resp.createMaterialsInvoice.errors.length > 0) {
          setError(resp.createMaterialsInvoice.errors.join(', '));
          return;
        }
        
        setSuccess('Invoice created: ' + resp.createMaterialsInvoice.invoice.id);
        // Force a refetch of queries with a small delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'Error creating invoice');
        console.error(err);
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} 
      className="bg-gray-50 p-6 rounded-lg shadow-md"
      sx={{ mb: 3 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Materials Invoice</h2>
      
      <TextField
        select
        label="Client"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.clientGlobalId}
        helperText={errors.clientGlobalId ? "Required" : ""}
        {...register("clientGlobalId", { required: true })}
        className="mb-4"
      >
        {clientsList.map((c: ClientNode) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      
      <TextField
        select
        label="Supplier"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.supplierGlobalId}
        helperText={errors.supplierGlobalId ? "Required" : ""}
        {...register("supplierGlobalId", { required: true })}
        className="mb-4"
      >
        {suppliersList.map((s: SupplierNode) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Invoice Date"
          type="datetime-local"
          variant="outlined"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.invoiceDate}
          helperText={errors.invoiceDate ? "Required" : ""}
          {...register("invoiceDate", { required: true })}
        />
        <TextField
          label="Base Amount"
          type="number"
          inputProps={{ step: "0.01" }}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.baseAmount}
          helperText={errors.baseAmount ? "Required" : ""}
          {...register("baseAmount", { required: true })}
        />
      </div>
      
      <Button 
        variant="contained" 
        color="primary" 
        type="submit"
        disabled={loading}
        className="mt-6 hover:bg-blue-700 transition-colors"
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Invoice'}
      </Button>

      {error && (
        <Box sx={{ color: 'error.main', mt: 2 }} className="p-3 bg-red-50 border border-red-200 rounded mt-4">
          Error: {error}
        </Box>
      )}
      
      {success && (
        <Box sx={{ color: 'success.main', mt: 2 }} className="p-3 bg-green-50 border border-green-200 rounded mt-4">
          {success}
        </Box>
      )}
    </Box>
  );
};

export default InvoiceForm; 