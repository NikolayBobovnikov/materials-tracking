/**
 * @generated SignedSource<<51b03a8fc7f4d7752ee1c3fd965b911a>>
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
  invoiceDate: string;
  supplierId: string;
};
export type CreateMaterialsInvoiceMutation$data = {
  readonly createMaterialsInvoice: {
    readonly errors: ReadonlyArray<string | null> | null;
    readonly invoice: {
      readonly __typename: "MaterialsInvoice";
      readonly baseAmount: number;
      readonly id: string;
    } | null;
  };
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
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
    "cacheID": "4653ac9f56b7fb4fed3e018531bb76a3",
    "id": null,
    "metadata": {},
    "name": "CreateMaterialsInvoiceMutation",
    "operationKind": "mutation",
    "text": "mutation CreateMaterialsInvoiceMutation(\n  $clientId: ID!\n  $supplierId: ID!\n  $invoiceDate: String!\n  $baseAmount: Float!\n) {\n  createMaterialsInvoice(clientId: $clientId, supplierId: $supplierId, invoiceDate: $invoiceDate, baseAmount: $baseAmount) {\n    invoice {\n      id\n      baseAmount\n      __typename\n    }\n    errors\n  }\n}\n"
  }
};
})();

(node as any).hash = "a70f01fc0b2ab300dfe5289c32ee1c83";

export default node;
