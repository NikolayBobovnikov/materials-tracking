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
  allClients: {
    edges: Array<{
      node: ClientNode;
    }>;
  };
  allSuppliers: {
    edges: Array<{
      node: SupplierNode;
    }>;
  };
};

const ALL_CLIENTS_SUPPLIERS_QUERY = graphql`
  query InvoiceFormClientsSuppliersQuery {
    allClients(first: 50) {
      edges {
        node {
          id
          name
        }
      }
    }
    allSuppliers(first: 50) {
      edges {
        node {
          id
          name
        }
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
  const data = useLazyLoadQuery<QueryResponse>(
    ALL_CLIENTS_SUPPLIERS_QUERY, 
    {}
  );
  const clients = data.allClients?.edges.map((e: {node: ClientNode}) => e.node) || [];
  const suppliers = data.allSuppliers?.edges.map((e: {node: SupplierNode}) => e.node) || [];

  const onSubmit = async (data: InvoiceFormInputs) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    createInvoice(
      environment,
      {
        clientId: data.clientGlobalId,
        supplierId: data.supplierGlobalId,
        invoiceDate: data.invoiceDate,
        baseAmount: parseFloat(data.baseAmount.toString()),
      },
      (resp: CreateMaterialsInvoiceMutationResponse) => {
        setLoading(false);
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
        {clients.map((c: ClientNode) => (
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
        {suppliers.map((s: SupplierNode) => (
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