import { toGlobalId, fromGlobalId } from './RelayEnvironment';

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