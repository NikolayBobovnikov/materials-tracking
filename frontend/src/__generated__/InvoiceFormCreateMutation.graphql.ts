/**
 * @generated SignedSource<<725a4608b31db18b75fc3140dd83bdd6>>
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
      readonly client: {
        readonly id: string;
        readonly name: string;
      };
      readonly id: string;
      readonly invoice_date: string;
      readonly status: string;
      readonly supplier: {
        readonly id: string;
        readonly name: string;
      };
    } | null;
  };
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  (v4/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v6 = [
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
    "concreteType": "MaterialsInvoicePayload",
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
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Client",
            "kind": "LinkedField",
            "name": "client",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Supplier",
            "kind": "LinkedField",
            "name": "supplier",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "invoice_date",
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
    "selections": (v6/*: any*/),
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
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "c0f41cb0916da13018a66b3e696dfd73",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation InvoiceFormCreateMutation(\n  $clientId: ID!\n  $supplierId: ID!\n  $invoiceDate: String!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount) {\n    invoice {\n      id\n      client {\n        id\n        name\n      }\n      supplier {\n        id\n        name\n      }\n      invoice_date\n      base_amount\n      status\n    }\n    errors\n  }\n}\n"
  }
};
})();

(node as any).hash = "27460b30bd61a377f2d091cc3f3f1ca5";

export default node;
