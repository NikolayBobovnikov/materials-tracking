import { toGlobalId, fromGlobalId } from './RelayEnvironment';
import { RelayEnvironment, resetRelayEnvironment } from './RelayEnvironment';

describe('RelayEnvironment utilities', () => {
  describe('toGlobalId', () => {
    it('should create a global ID with the correct format', () => {
      const result = toGlobalId('Client', '123');
      expect(result).toBe('Client:123');
    });
  });

  describe('fromGlobalId', () => {
    it('should extract type and id from a global ID', () => {
      const { type, id } = fromGlobalId('Client:123');
      expect(type).toBe('Client');
      expect(id).toBe('123');
    });

    it('should throw an error for invalid global ID format', () => {
      expect(() => fromGlobalId('InvalidFormat')).toThrow('Invalid global ID format');
    });
  });
});

describe('RelayEnvironment', () => {
  beforeEach(() => {
    resetRelayEnvironment();
    global.fetch = jest.fn();
  });

  it('should reset the environment correctly', () => {
    const originalStore = RelayEnvironment.getStore();
    resetRelayEnvironment();
    const newStore = RelayEnvironment.getStore();
    expect(newStore).not.toBe(originalStore);
  });

  it('should handle valid JSON responses correctly', async () => {
    // Mock a successful API response
    const mockResponse = {
      data: {
        clients: {
          edges: [
            {
              node: { id: 'client-1', name: 'Test Client' },
              cursor: 'cursor1'
            }
          ],
          pageInfo: { hasNextPage: false, endCursor: null }
        }
      }
    };

    // Set up the fetch mock
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    // Get the network from the environment and execute a query
    const network = RelayEnvironment.getNetwork();
    const result = await network.execute({
      text: 'query { clients { edges { node { id name } cursor } pageInfo { hasNextPage endCursor } } }',
      name: 'TestQuery',
      id: null,
      cacheID: 'test-cache-id-1',
      operationKind: 'query',
      metadata: {}
    }, {}, {
      force: false
    });

    // Verify the result
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/graphql', expect.anything());
  });

  it('should handle malformed JSON responses', async () => {
    // Mock a malformed JSON response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.reject(new SyntaxError('JSON.parse: unexpected character')),
    });

    // Get the network from the environment
    const network = RelayEnvironment.getNetwork();
    
    // The execute method should reject with the JSON parse error
    await expect(
      network.execute({
        text: 'query { clients { edges { node { id name } } } }',
        name: 'TestQuery',
        id: null,
        cacheID: 'test-cache-id-2',
        operationKind: 'query',
        metadata: {}
      }, {}, {
        force: false
      })
    ).rejects.toThrow('JSON.parse');
  });
}); 