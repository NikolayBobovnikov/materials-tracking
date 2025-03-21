import { graphql, commitMutation } from 'react-relay';
import { Environment } from 'relay-runtime';

export type CreateMaterialsInvoiceMutationResponse = {
  createMaterialsInvoice: {
    invoice: {
      id: string;
      base_amount: number;
      __typename: string;
    };
    errors: string[] | null;
  };
};

const CreateMaterialsInvoiceMutation = graphql`
  mutation CreateMaterialsInvoiceMutation(
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
        __typename
      }
      errors
    }
  }
`;

export function createInvoice(
  environment: Environment,
  variables: {
    clientId: string;     // Relay global ID
    supplierId: string;   // Relay global ID
    invoiceDate: string;  // or Date
    baseAmount: number;
  },
  onCompleted: (response: any, errors: readonly Error[] | null | undefined) => void,
  onError: (err: any) => void
) {
  return commitMutation(environment, {
    mutation: CreateMaterialsInvoiceMutation,
    variables: variables,
    onCompleted: (response, errors) => {
      onCompleted(response as CreateMaterialsInvoiceMutationResponse, errors as readonly Error[] | null | undefined);
    },
    onError,
  });
} 