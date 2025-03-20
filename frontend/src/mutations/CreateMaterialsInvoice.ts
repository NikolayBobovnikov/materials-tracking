import { graphql, commitMutation } from 'react-relay';
import { Environment } from 'relay-runtime';

export type CreateMaterialsInvoiceMutationResponse = {
  createMaterialsInvoice: {
    invoice: {
      id: string;
      baseAmount: number;
    };
  };
};

const CreateMaterialsInvoiceMutation = graphql`
  mutation CreateMaterialsInvoiceMutation(
    $clientId: String!
    $supplierId: String!
    $invoiceDate: DateTime!
    $baseAmount: Float!
  ) {
    createMaterialsInvoice(
      input: {
        clientId: $clientId
        supplierId: $supplierId
        invoiceDate: $invoiceDate
        baseAmount: $baseAmount
      }
    ) {
      invoice {
        id
        baseAmount
      }
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
  onCompleted: (resp: CreateMaterialsInvoiceMutationResponse) => void,
  onError: (err: any) => void
) {
  return commitMutation(environment, {
    mutation: CreateMaterialsInvoiceMutation,
    variables: variables,
    onCompleted,
    onError,
  });
} 