/**
 * @generated SignedSource<<0a6a114586832b4d22c6fc5d685eefe0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type InvoiceFormClientsSuppliersQuery$variables = {
  clientsAfter?: string | null;
  clientsFirst?: number | null;
  suppliersAfter?: string | null;
  suppliersFirst?: number | null;
};
export type InvoiceFormClientsSuppliersQuery$data = {
  readonly clients: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  };
  readonly suppliers: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  };
};
export type InvoiceFormClientsSuppliersQuery = {
  response: InvoiceFormClientsSuppliersQuery$data;
  variables: InvoiceFormClientsSuppliersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "clientsAfter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "clientsFirst"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "suppliersAfter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "suppliersFirst"
},
v4 = [
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
    "name": "name",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "clientsAfter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "clientsFirst"
      }
    ],
    "concreteType": "ClientConnection",
    "kind": "LinkedField",
    "name": "clients",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Client",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v4/*: any*/),
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      (v6/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "suppliersAfter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "suppliersFirst"
      }
    ],
    "concreteType": "SupplierConnection",
    "kind": "LinkedField",
    "name": "suppliers",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "SupplierEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Supplier",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v4/*: any*/),
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      },
      (v6/*: any*/)
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
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "8ac1a1a266fbd7a6ae32f175557add30",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormClientsSuppliersQuery",
    "operationKind": "query",
    "text": "query InvoiceFormClientsSuppliersQuery(\n  $clientsFirst: Int\n  $suppliersFirst: Int\n  $clientsAfter: String\n  $suppliersAfter: String\n) {\n  clients(first: $clientsFirst, after: $clientsAfter) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  suppliers(first: $suppliersFirst, after: $suppliersAfter) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "167f19f36fae4357a904ca77c6a82407";

export default node;
