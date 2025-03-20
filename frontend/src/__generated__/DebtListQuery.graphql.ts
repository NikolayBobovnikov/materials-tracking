/**
 * @generated SignedSource<<60279f10e58fa4647b2fd3acad367a84>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type DebtListQuery$variables = {};
export type DebtListQuery$data = {
  readonly allDebts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly amount: number;
        readonly createdDate: any | null;
        readonly id: string;
        readonly invoice: {
          readonly id: string;
        } | null;
        readonly party: string;
      } | null;
    } | null> | null;
  } | null;
};
export type DebtListQuery = {
  response: DebtListQuery$data;
  variables: DebtListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 50
      }
    ],
    "concreteType": "DebtNodeConnection",
    "kind": "LinkedField",
    "name": "allDebts",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DebtNodeEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DebtNode",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "party",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "amount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdDate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MaterialsInvoiceNode",
                "kind": "LinkedField",
                "name": "invoice",
                "plural": false,
                "selections": [
                  (v0/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "allDebts(first:50)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DebtListQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DebtListQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "37afd6afe902866c3fc18d87416addf2",
    "id": null,
    "metadata": {},
    "name": "DebtListQuery",
    "operationKind": "query",
    "text": "query DebtListQuery {\n  allDebts(first: 50) {\n    edges {\n      node {\n        id\n        party\n        amount\n        createdDate\n        invoice {\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6bdf07a37cd600c33f1cf85fc092b379";

export default node;
