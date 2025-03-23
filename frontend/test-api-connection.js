/**
 * API Connection Test Script
 * 
 * This script tests the connection to the backend GraphQL API
 * and validates the JSON response format.
 */

const fetch = require('node-fetch');

async function testApiConnection() {
  console.log('Testing API connection to GraphQL endpoint...');
  
  try {
    // Test a simple query against the GraphQL API
    const response = await fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query TestQuery {
            clients(first: 1) {
              edges {
                node {
                  id
                  name
                }
                cursor
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `
      })
    });

    // Log the status of the response
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Try to parse response as JSON
    const text = await response.text();
    console.log('Raw response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    try {
      const json = JSON.parse(text);
      console.log('JSON parsed successfully');
      if (json.errors) {
        console.error('GraphQL errors:', json.errors);
      } else if (json.data) {
        console.log('Valid GraphQL response received');
        console.log(JSON.stringify(json.data, null, 2));
      } else {
        console.warn('Unexpected response format:', json);
      }
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError.message);
      console.error('The backend is not returning valid JSON. This is likely the cause of your error.');
      console.error('First 100 characters of response:', text.substring(0, 100));
    }
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

testApiConnection(); 