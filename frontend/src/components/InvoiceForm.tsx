import React from 'react';
import { TextField, Button, Box, CircularProgress, MenuItem, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useMutation } from 'react-relay/hooks';
import type { InvoiceFormClientsSuppliersQuery } from './../__generated__/InvoiceFormClientsSuppliersQuery.graphql';
import { RelayEnvironment, resetRelayEnvironment } from '../RelayEnvironment';

// Query for clients and suppliers with smaller initial batch
const query = graphql`
  query InvoiceFormClientsSuppliersQuery($clientsFirst: Int, $suppliersFirst: Int, $clientsAfter: String, $suppliersAfter: String) {
    clients(first: $clientsFirst, after: $clientsAfter) {
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
    suppliers(first: $suppliersFirst, after: $suppliersAfter) {
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
        client {
          id
          name
        }
        supplier {
          id
          name
        }
        invoice_date
        base_amount
        status
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

// Response type for createMaterialsInvoice mutation
interface MutationResponse {
  createMaterialsInvoice: {
    invoice: {
      id: string;
      client: {
        id: string;
        name: string;
      };
      supplier: {
        id: string;
        name: string;
      };
      invoice_date: string;
      base_amount: number;
      status: string;
    };
    errors: string[] | null;
  };
}

// Define a type that matches the actual query response structure
type QueryResponse = {
  clients: {
    edges: Array<{
      node: ClientNode;
      cursor: string;
    } | null> | null;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
  suppliers: {
    edges: Array<{
      node: SupplierNode;
      cursor: string;
    } | null> | null;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

const InvoiceForm: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<InvoiceFormInputs>();
  const [clientsAfter, setClientsAfter] = React.useState<string | null>(null);
  const [suppliersAfter, setSuppliersAfter] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  // Reset the Relay environment when the component mounts
  React.useEffect(() => {
    resetRelayEnvironment();
  }, []);
  
  // Load clients and suppliers data with smaller initial batch
  const data = useLazyLoadQuery<InvoiceFormClientsSuppliersQuery>(
    query, 
    { 
      clientsFirst: 10, 
      suppliersFirst: 10,
      clientsAfter,
      suppliersAfter
    },
    {
      fetchPolicy: 'network-only' // Force network fetch, ignore cache
    }
  );
  
  // Log the raw data from the query for debugging
  console.log('===== RAW GRAPHQL RESPONSE =====');
  console.log('Raw Data Type:', typeof data);
  console.log('Raw Data Structure:', Object.keys(data || {}));
  console.log('Raw Query Data:', JSON.stringify(data, null, 2));
  console.log('Raw clients data:', data?.clients?.edges);
  console.log('Raw suppliers data:', data?.suppliers?.edges);
  
  // Process clients data
  const clientsList = React.useMemo(() => {
    if (!data?.clients?.edges || !Array.isArray(data.clients.edges)) {
      console.error('No valid clients data found');
      return [];
    }
    
    return data.clients.edges
      .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge && edge.node))
      .map(edge => ({
        id: edge.node.id,
        name: edge.node.name
      }));
  }, [data?.clients?.edges]);
  
  // Process suppliers data separately
  const suppliersList = React.useMemo(() => {
    if (!data?.suppliers?.edges || !Array.isArray(data.suppliers.edges)) {
      console.error('No valid suppliers data found');
      return [];
    }
    
    return data.suppliers.edges
      .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge && edge.node))
      .map(edge => ({
        id: edge.node.id,
        name: edge.node.name
      }));
  }, [data?.suppliers?.edges]);
  
  // Watch form values for debugging
  const clientValue = watch("clientGlobalId");
  const supplierValue = watch("supplierGlobalId");
  
  console.log('===== FORM VALUES =====');
  console.log('Selected client ID:', clientValue);
  console.log('Selected supplier ID:', supplierValue);
  
  // For debugging - log the final processed lists
  console.log('===== FINAL PROCESSED DATA =====');
  console.log('Clients list:', clientsList);
  console.log('Suppliers list:', suppliersList);
  
  // Handle load more for clients or suppliers
  const handleLoadMore = (type: 'clients' | 'suppliers'): void => {
    if (type === 'clients' && data?.clients?.pageInfo.endCursor) {
      setClientsAfter(data.clients.pageInfo.endCursor);
    } else if (type === 'suppliers' && data?.suppliers?.pageInfo.endCursor) {
      setSuppliersAfter(data.suppliers.pageInfo.endCursor);
    }
  };

  // Set up mutation
  const [commitMutation, isMutationInFlight] = useMutation(createInvoiceMutation);

  const onSubmit = async (formData: InvoiceFormInputs): Promise<void> => {
    setSuccess(null);
    setError(null);
    setLoading(true);
    
    console.log('Form submission data:', formData);
    
    commitMutation({
      variables: {
        clientId: formData.clientGlobalId,
        supplierId: formData.supplierGlobalId,
        invoiceDate: formData.invoiceDate,
        baseAmount: parseFloat(formData.baseAmount.toString()),
      },
      onCompleted: (response, errors) => {
        setLoading(false);
        
        // Type cast the response to our expected type
        const typedResponse = response as unknown as MutationResponse;
        
        if (typedResponse?.createMaterialsInvoice?.errors && typedResponse.createMaterialsInvoice.errors.length > 0) {
          setError(typedResponse.createMaterialsInvoice.errors.join(', '));
          return;
        }
        
        setSuccess('Invoice created: ' + typedResponse?.createMaterialsInvoice?.invoice?.id);
        reset(); // Reset form fields

        // Instead of reloading the page, refresh the query data
        setClientsAfter(null);
        setSuppliersAfter(null);
      },
      onError: (err: Error) => {
        setLoading(false);
        setError(err.message || 'Error creating invoice');
        console.error(err);
      },
      updater: (store: any) => {
        const payload = store.getRootField('createMaterialsInvoice');
        if (!payload) return;
        
        const invoice = payload.getLinkedRecord('invoice');
        if (!invoice) return;
        
        setTimeout(() => {
          // Reset pagination state to trigger a refetch
          setClientsAfter(null);
          setSuppliersAfter(null);
        }, 1500);
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} 
      className="bg-gray-50 p-6 rounded-lg shadow-md"
      sx={{ mb: 3 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Materials Invoice</h2>
      
      {/* Display debugging information */}
      <div style={{ padding: '8px', margin: '8px 0', fontSize: '12px', border: '1px solid #eee' }}>
        <div><strong>Clients loaded:</strong> {clientsList.length}</div>
        <div><strong>Suppliers loaded:</strong> {suppliersList.length}</div>
      </div>
      
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
      
      {/* Client Dropdown */}
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
        inputProps={{ 'data-testid': 'client-select' }}
      >
        <MenuItem value="">Select a client</MenuItem>
        {clientsList.map((client) => (
          <MenuItem key={`client-${client.id}`} value={client.id}>
            {client.name} (ID: {client.id})
          </MenuItem>
        ))}
      </TextField>
      
      {/* Supplier Dropdown */}
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
        inputProps={{ 'data-testid': 'supplier-select' }}
      >
        <MenuItem value="">Select a supplier</MenuItem>
        {suppliersList.map((supplier) => (
          <MenuItem key={`supplier-${supplier.id}`} value={supplier.id}>
            {supplier.name} (ID: {supplier.id})
          </MenuItem>
        ))}
      </TextField>
      
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
        disabled={isMutationInFlight || loading}
        className="mt-4"
        sx={{ mt: 2 }}
      >
        {isMutationInFlight ? <CircularProgress size={24} /> : "Create Invoice"}
      </Button>
    </Box>
  );
};

export default InvoiceForm; 