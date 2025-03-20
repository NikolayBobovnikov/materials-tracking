import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import InvoiceForm from './components/InvoiceForm';
import DebtList from './components/DebtList';
import TransactionList from './components/TransactionList';

function App() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Materials Tracking Module
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Create Invoice
          </Typography>
          <InvoiceForm />
        </Grid>
        <Grid item xs={12} md={6}>
          <TransactionList />
          <Box sx={{ mt: 4 }}>
            <DebtList />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
