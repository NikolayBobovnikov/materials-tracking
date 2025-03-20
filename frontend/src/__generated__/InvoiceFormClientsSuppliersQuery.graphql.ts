/**
 * @generated SignedSource<<6c4b0b4a0f58749d7519ace0c0d9ffa3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type InvoiceFormClientsSuppliersQuery$variables = {};
export type InvoiceFormClientsSuppliersQuery$data = {
  readonly allClients: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      } | null;
    } | null> | null;
  } | null;
  readonly allSuppliers: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      } | null;
    } | null> | null;
  } | null;
};
export type InvoiceFormClientsSuppliersQuery = {
  response: InvoiceFormClientsSuppliersQuery$data;
  variables: InvoiceFormClientsSuppliersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
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
v2 = [
  {
    "alias": null,
    "args": (v0/*: any*/),
    "concreteType": "ClientNodeConnection",
    "kind": "LinkedField",
    "name": "allClients",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ClientNodeEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ClientNode",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "allClients(first:50)"
  },
  {
    "alias": null,
    "args": (v0/*: any*/),
    "concreteType": "SupplierNodeConnection",
    "kind": "LinkedField",
    "name": "allSuppliers",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "SupplierNodeEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SupplierNode",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": (v1/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "allSuppliers(first:50)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "InvoiceFormClientsSuppliersQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "494f98e2bbe74aa7549bf7fdc23687ac",
    "id": null,
    "metadata": {},
    "name": "InvoiceFormClientsSuppliersQuery",
    "operationKind": "query",
    "text": "query InvoiceFormClientsSuppliersQuery {\n  allClients(first: 50) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n  allSuppliers(first: 50) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "550817b0853d7fb9cc4e1331542aefb7";

export default node;
