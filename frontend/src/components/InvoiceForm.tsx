import React from 'react';
import { TextField, Button, Box, CircularProgress, MenuItem, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useMutation } from 'react-relay/hooks';
import type { InvoiceFormClientsSuppliersQuery } from './../__generated__/InvoiceFormClientsSuppliersQuery.graphql';

// Query for clients and suppliers with smaller initial batch
const query = graphql`
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

// Create invoice mutation - update to match the schema
const createInvoiceMutation = graphql`
  mutation InvoiceFormCreateMutation(
    $clientId: ID!
    $supplierId: ID!
    $invoiceDate: String!
    $baseAmount: Float!
  ) {
    createMaterialsInvoice(
      clientId: $clientId
      supplierId: $supplierId
      invoiceDate: $invoiceDate
      baseAmount: $baseAmount
    ) {
      invoice {
        id
        base_amount
        status
        invoice_date
      }
      errors
    }
  }
`;

type InvoiceFormInputs = {
  clientGlobalId: string;
  supplierGlobalId: string;
  invoiceDate: string;
  baseAmount: number;
};

type ClientNode = {
  id: string;
  name: string;
};

type SupplierNode = {
  id: string;
  name: string;
};

// Define mutation response type until it's generated
interface CreateMaterialsInvoiceResponse {
  createMaterialsInvoice: {
    invoice: {
      id: string;
      base_amount: number;
      status: string;
      invoice_date: string;
    };
    errors: string[] | null;
  };
}

const InvoiceForm: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceFormInputs>();
  const [loadMore, setLoadMore] = React.useState({ clients: false, suppliers: false });
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Load clients and suppliers data with smaller initial batch
  const queryData = useLazyLoadQuery<InvoiceFormClientsSuppliersQuery['response']>(
    query, 
    { clientsFirst: 10, suppliersFirst: 10 }
  );
  
  // Set up mutation
  const [commitMutation, isMutationInFlight] = useMutation(createInvoiceMutation);
  
  // Extract clients and suppliers from query data
  const clientsList = queryData.clients?.edges?.map(edge => edge?.node).filter(Boolean) as ClientNode[] || [];
  const suppliersList = queryData.suppliers?.edges?.map(edge => edge?.node).filter(Boolean) as SupplierNode[] || [];
  
  // Handle load more for clients or suppliers
  const handleLoadMore = (type: 'clients' | 'suppliers'): void => {
    setLoadMore(prev => ({ ...prev, [type]: true }));
  };

  const onSubmit = async (formData: InvoiceFormInputs): Promise<void> => {
    setSuccess(null);
    setError(null);
    
    commitMutation({
      variables: {
        clientId: formData.clientGlobalId,
        supplierId: formData.supplierGlobalId,
        invoiceDate: formData.invoiceDate,
        baseAmount: parseFloat(formData.baseAmount.toString())
      },
      onCompleted: (response: CreateMaterialsInvoiceResponse) => {
        const result = response.createMaterialsInvoice;
        
        if (result.errors && result.errors.length > 0) {
          setError(result.errors.join(', '));
          return;
        }
        
        // On success
        setSuccess(`Invoice created: ${result.invoice.id}`);
        reset(); // Reset form fields
      },
      onError: (err: Error) => {
        setError(err.message || 'Error creating invoice');
        console.error(err);
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} 
      className="bg-gray-50 p-6 rounded-lg shadow-md"
      sx={{ mb: 3 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Materials Invoice</h2>
      
      {/* Display success or error message */}
      {success && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          {success}
        </Box>
      )}
      
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          {error}
        </Box>
      )}
      
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
        <MenuItem value="">Select a client</MenuItem>
        {clientsList.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      
      {queryData.clients?.pageInfo.hasNextPage && !loadMore.clients && (
        <FormHelperText>
          <Button onClick={() => handleLoadMore('clients')} size="small">
            Load more clients
          </Button>
        </FormHelperText>
      )}
      
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
        <MenuItem value="">Select a supplier</MenuItem>
        {suppliersList.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>
      
      {queryData.suppliers?.pageInfo.hasNextPage && !loadMore.suppliers && (
        <FormHelperText>
          <Button onClick={() => handleLoadMore('suppliers')} size="small">
            Load more suppliers
          </Button>
        </FormHelperText>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          type="date"
          label="Invoice Date"
          variant="outlined"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          error={!!errors.invoiceDate}
          helperText={errors.invoiceDate ? "Required" : ""}
          {...register("invoiceDate", { required: true })}
        />
        
        <TextField
          type="number"
          label="Base Amount"
          variant="outlined"
          margin="normal"
          error={!!errors.baseAmount}
          helperText={errors.baseAmount ? "Required" : ""}
          {...register("baseAmount", { 
            required: true, 
            valueAsNumber: true,
            min: { value: 0.01, message: "Amount must be positive" }
          })}
        />
      </div>
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        disabled={isMutationInFlight}
        className="mt-4"
        sx={{ mt: 2 }}
      >
        {isMutationInFlight ? <CircularProgress size={24} /> : "Create Invoice"}
      </Button>
    </Box>
  );
};

export default InvoiceForm; 