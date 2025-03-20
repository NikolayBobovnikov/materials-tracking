/**
 * @generated SignedSource<<02af26d6bf0a22e45d67718caa337583>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type InvoiceFormClientsSuppliersQuery$variables = {
  clientsFirst?: number | null;
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "clientsFirst"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "suppliersFirst"
  }
],
v1 = [
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v3 = {
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
v4 = [
  {
    "alias": null,
    "args": [
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
            "selections": (v1/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
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
            "selections": (v1/*: any*/),
            "storageKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "839e59d832af61f48ade048c7b9d1c4a",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormClientsSuppliersQuery",
    "operationKind": "query",
    "text": "query InvoiceFormClientsSuppliersQuery(\n  $clientsFirst: Int\n  $suppliersFirst: Int\n) {\n  clients(first: $clientsFirst) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  suppliers(first: $suppliersFirst) {\n    edges {\n      node {\n        id\n        name\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e5972f4acde55ef0030cfdadaf97927f";

export default node;
