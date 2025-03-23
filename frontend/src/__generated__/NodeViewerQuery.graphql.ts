/**
 * @generated SignedSource<<7f68d5598eecc69ddccf66ecf7ec875e>>
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
    readonly baseAmount?: number;
    readonly client?: {
      readonly id: string;
      readonly name: string;
    };
    readonly id: string;
    readonly invoiceDate?: string;
    readonly markup_rate?: number;
    readonly name?: string;
    readonly status?: string;
    readonly supplier?: {
      readonly id: string;
      readonly name: string;
    };
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
v6 = [
  (v2/*: any*/),
  (v3/*: any*/)
],
v7 = {
  "kind": "InlineFragment",
  "selections": [
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
      "name": "invoiceDate",
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
      "concreteType": "Client",
      "kind": "LinkedField",
      "name": "client",
      "plural": false,
      "selections": (v6/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Supplier",
      "kind": "LinkedField",
      "name": "supplier",
      "plural": false,
      "selections": (v6/*: any*/),
      "storageKey": null
    }
  ],
  "type": "MaterialsInvoice",
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
          (v7/*: any*/)
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
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0219c0f08f3710606fb5e6ea2a162507",
    "id": null,
    "metadata": {},
    "name": "NodeViewerQuery",
    "operationKind": "query",
    "text": "query NodeViewerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ... on Client {\n      name\n      markup_rate\n    }\n    ... on Supplier {\n      name\n    }\n    ... on MaterialsInvoice {\n      baseAmount\n      invoiceDate\n      status\n      client {\n        id\n        name\n      }\n      supplier {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4eaafece80376b86c50877d0d9ba3d86";

export default node;
