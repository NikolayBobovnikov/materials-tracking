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

const mutation = graphql`
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
  onCompleted: (response: CreateMaterialsInvoiceMutationResponse, errors: readonly Error[] | null | undefined) => void,
  onError: (err: Error) => void
): ReturnType<typeof commitMutation> {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response: unknown, errors: unknown) => {
      onCompleted(response as CreateMaterialsInvoiceMutationResponse, errors as readonly Error[] | null | undefined);
    },
    onError,
  });
} 