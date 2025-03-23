/**
 * @generated SignedSource<<7bb2c9da097b37d2fbd9821e47022daf>>
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
      readonly baseAmount: number;
      readonly client: {
        readonly id: string;
        readonly name: string;
      };
      readonly id: string;
      readonly invoiceDate: string;
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
            "name": "invoiceDate",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "baseAmount",
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
    "cacheID": "4f12eec26a5645cc722f51726c9729b0",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation InvoiceFormCreateMutation(\n  $clientId: ID!\n  $supplierId: ID!\n  $invoiceDate: String!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount) {\n    invoice {\n      id\n      client {\n        id\n        name\n      }\n      supplier {\n        id\n        name\n      }\n      invoiceDate\n      baseAmount\n      status\n    }\n    errors\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b01c820819b8d06e1e59e83d2c38a16";

export default node;
