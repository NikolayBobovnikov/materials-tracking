/**
 * @generated SignedSource<<3b5e19840f42f993fa6fd3574d369234>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateMaterialsInvoiceMutation$variables = {
  baseAmount: number;
  clientId: string;
  invoiceDate: any;
  supplierId: string;
};
export type CreateMaterialsInvoiceMutation$data = {
  readonly createMaterialsInvoice: {
    readonly invoice: {
      readonly baseAmount: number;
      readonly id: string;
    } | null;
  } | null;
};
export type CreateMaterialsInvoiceMutation = {
  response: CreateMaterialsInvoiceMutation$data;
  variables: CreateMaterialsInvoiceMutation$variables;
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
        "fields": [
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
        "kind": "ObjectValue",
        "name": "input"
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
        "concreteType": "MaterialsInvoiceNode",
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
            "name": "baseAmount",
            "storageKey": null
          }
        ],
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
    "name": "CreateMaterialsInvoiceMutation",
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
    "name": "CreateMaterialsInvoiceMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "d48ffa7491a8a6dbc3c740b5f6667c65",
    "id": null,
    "metadata": {},
    "name": "CreateMaterialsInvoiceMutation",
    "operationKind": "mutation",
    "text": "mutation CreateMaterialsInvoiceMutation(\n  $clientId: String!\n  $supplierId: String!\n  $invoiceDate: DateTime!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(input: {clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount}) {\n    invoice {\n      id\n      baseAmount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3307d69824687751129c89be63107cc5";

export default node;
