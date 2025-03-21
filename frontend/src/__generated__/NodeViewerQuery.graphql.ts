/**
 * @generated SignedSource<<cb68394268d04c5d1f526b9b2edb1bea>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type NodeViewerQuery$variables = {
  id: string;
};
export type NodeViewerQuery$data = {
  readonly node: {
    readonly amount?: number;
    readonly base_amount?: number;
    readonly created_date?: string;
    readonly id: string;
    readonly invoice_date?: string;
    readonly markup_rate?: number;
    readonly name?: string;
    readonly party?: string;
    readonly status?: string;
    readonly transaction_date?: string;
  } | null;
};
export type NodeViewerQuery = {
  response: NodeViewerQuery$data;
  variables: NodeViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markup_rate",
      "storageKey": null
    }
  ],
  "type": "Client",
  "abstractKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    (v3/*: any*/)
  ],
  "type": "Supplier",
  "abstractKey": null
},
v6 = {
  "kind": "InlineFragment",
  "selections": [
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
  "type": "MaterialsInvoice",
  "abstractKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "amount",
  "storageKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    (v7/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "transaction_date",
      "storageKey": null
    }
  ],
  "type": "Transaction",
  "abstractKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "party",
      "storageKey": null
    },
    (v7/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_date",
      "storageKey": null
    }
  ],
  "type": "Debt",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NodeViewerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NodeViewerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6b7a0b6238b8779c87646fb9b543af6d",
    "id": null,
    "metadata": {},
    "name": "NodeViewerQuery",
    "operationKind": "query",
    "text": "query NodeViewerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on Client {\n      name\n      markup_rate\n    }\n    ... on Supplier {\n      name\n    }\n    ... on MaterialsInvoice {\n      base_amount\n      status\n      invoice_date\n    }\n    ... on Transaction {\n      amount\n      transaction_date\n    }\n    ... on Debt {\n      party\n      amount\n      created_date\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9689483ab7538ac1b455fa6bc2b9e5c8";

export default node;
