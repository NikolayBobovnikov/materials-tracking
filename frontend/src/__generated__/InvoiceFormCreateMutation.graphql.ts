/**
 * @generated SignedSource<<2f77ae5b4fbee998bb3570c3e9d8205f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type InvoiceFormCreateMutation$variables = {
  baseAmount: number;
  clientId: string;
  invoiceDate: string;
  supplierId: string;
};
export type InvoiceFormCreateMutation$data = {
  readonly createMaterialsInvoice: {
    readonly errors: ReadonlyArray<string | null> | null;
    readonly invoice: {
      readonly base_amount: number;
      readonly id: string;
      readonly invoice_date: string;
      readonly status: string;
    } | null;
  } | null;
};
export type InvoiceFormCreateMutation = {
  response: InvoiceFormCreateMutation$data;
  variables: InvoiceFormCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "baseAmount"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "clientId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "invoiceDate"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supplierId"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "baseAmount",
        "variableName": "baseAmount"
      },
      {
        "kind": "Variable",
        "name": "clientId",
        "variableName": "clientId"
      },
      {
        "kind": "Variable",
        "name": "invoiceDate",
        "variableName": "invoiceDate"
      },
      {
        "kind": "Variable",
        "name": "supplierId",
        "variableName": "supplierId"
      }
    ],
    "concreteType": "CreateMaterialsInvoicePayload",
    "kind": "LinkedField",
    "name": "createMaterialsInvoice",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "MaterialsInvoice",
        "kind": "LinkedField",
        "name": "invoice",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "base_amount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "invoice_date",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errors",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "InvoiceFormCreateMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "InvoiceFormCreateMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "4705b51f09d3bfff4e9d3b8a18a5cbfe",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation InvoiceFormCreateMutation(\n  $clientId: ID!\n  $supplierId: ID!\n  $invoiceDate: String!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount) {\n    invoice {\n      id\n      base_amount\n      status\n      invoice_date\n    }\n    errors\n  }\n}\n"
  }
};
})();

(node as any).hash = "4514b274e851b9561716c6f6be23ebac";

export default node;
