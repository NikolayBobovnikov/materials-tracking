/**
 * @generated SignedSource<<f20d17ab7c21fc0a2851b66fd7e47bbb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type TransactionListQuery$variables = {};
export type TransactionListQuery$data = {
  readonly allTransactions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly amount: number;
        readonly id: string;
        readonly invoice: {
          readonly id: string;
        } | null;
        readonly transactionDate: any | null;
      } | null;
    } | null> | null;
  } | null;
};
export type TransactionListQuery = {
  response: TransactionListQuery$data;
  variables: TransactionListQuery$variables;
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
    "concreteType": "TransactionNodeConnection",
    "kind": "LinkedField",
    "name": "allTransactions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionNodeEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TransactionNode",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v0/*: any*/),
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
                "name": "transactionDate",
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
    "storageKey": "allTransactions(first:50)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "TransactionListQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TransactionListQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "eb4d48e721e851e3b318a2859958fd4e",
    "id": null,
    "metadata": {},
    "name": "TransactionListQuery",
    "operationKind": "query",
    "text": "query TransactionListQuery {\n  allTransactions(first: 50) {\n    edges {\n      node {\n        id\n        amount\n        transactionDate\n        invoice {\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4dc03b6a6827a1b90322a5ea5cb7fd7f";

export default node;
