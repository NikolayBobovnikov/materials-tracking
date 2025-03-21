/**
 * Custom ESLint plugin for enforcing Relay type patterns
 * This helps catch common type mistakes before they cause runtime issues
 */

module.exports = {
  rules: {
    'proper-query-typing': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce proper type patterns when using useLazyLoadQuery',
          category: 'TypeScript',
          recommended: true,
        },
        fixable: 'code',
        schema: []
      },
      create: function(context) {
        return {
          CallExpression(node) {
            // Check for useLazyLoadQuery calls
            if (node.callee.name === 'useLazyLoadQuery') {
              // If there are type parameters
              if (node.typeParameters && node.typeParameters.params && node.typeParameters.params.length > 0) {
                const typeParam = context.getSourceCode().getText(node.typeParameters.params[0]);
                
                // Check if it uses the correct pattern
                const hasResponseProp = typeParam.includes("['response']") || typeParam.includes('["response"]');
                const usesResponseType = typeParam.includes('ResponseType<');
                
                if (!hasResponseProp && !usesResponseType) {
                  context.report({
                    node: node.typeParameters.params[0],
                    message: "useLazyLoadQuery should use Type['response'] pattern or ResponseType<Type>",
                    fix: function(fixer) {
                      // Try to fix by adding ['response']
                      return fixer.insertTextAfter(
                        node.typeParameters.params[0], 
                        "['response']"
                      );
                    }
                  });
                }
              } else {
                // No type parameters at all
                context.report({
                  node,
                  message: "useLazyLoadQuery should have explicit type parameters using Type['response'] pattern"
                });
              }
            }
          }
        };
      }
    },
    
    'validate-connection-edges': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure proper null checking when mapping over connection edges',
          category: 'TypeScript',
          recommended: true,
        },
        schema: []
      },
      create: function(context) {
        return {
          CallExpression(node) {
            // Look for .map() calls on edges
            if (node.callee.type === 'MemberExpression' && 
                node.callee.property.name === 'map' &&
                node.callee.object.type === 'MemberExpression' &&
                node.callee.object.property.name === 'edges') {
              
              // Check if the callback has a parameter
              if (node.arguments.length > 0 && 
                  node.arguments[0].type === 'ArrowFunctionExpression' &&
                  node.arguments[0].params.length > 0) {
                
                const callbackBody = node.arguments[0].body;
                const edgeParam = node.arguments[0].params[0];
                
                // Check if there's a null check for the edge or node 
                let hasNullCheck = false;
                
                // If the body is a block statement, look for null checks
                if (callbackBody.type === 'BlockStatement') {
                  callbackBody.body.forEach(statement => {
                    if (statement.type === 'IfStatement') {
                      const test = context.getSourceCode().getText(statement.test);
                      if (test.includes('!edge') || test.includes('!edge.node')) {
                        hasNullCheck = true;
                      }
                    }
                  });
                }
                
                // If no null check is found, report an error
                if (!hasNullCheck) {
                  context.report({
                    node: edgeParam,
                    message: "Always check for null/undefined when mapping over edges (e.g., if (!edge || !edge.node) return null)"
                  });
                }
              }
            }
          }
        };
      }
    }
  }
}; 