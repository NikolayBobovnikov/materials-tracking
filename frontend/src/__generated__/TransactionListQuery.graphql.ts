/**
 * @generated SignedSource<<3de9442434d6071e39b1c97e3d1e4f9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type TransactionListQuery$variables = {
  after?: string | null;
  first?: number | null;
};
export type TransactionListQuery$data = {
  readonly transactions: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly amount: number;
        readonly id: string;
        readonly transactionDate: string;
      };
    } | null> | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean;
    };
  };
};
export type TransactionListQuery = {
  response: TransactionListQuery$data;
  variables: TransactionListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "TransactionConnection",
    "kind": "LinkedField",
    "name": "transactions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TransactionEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Transaction",
            "kind": "LinkedField",
            "name": "node",
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
                "name": "amount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "transactionDate",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TransactionListQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TransactionListQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "cb229cbe1474f72782a9425fc9ae7bae",
    "id": null,
    "metadata": {},
    "name": "TransactionListQuery",
    "operationKind": "query",
    "text": "query TransactionListQuery(\n  $first: Int\n  $after: String\n) {\n  transactions(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        amount\n        transactionDate\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0af21a77d7540469e35b3af7a5ae3640";

export default node;
