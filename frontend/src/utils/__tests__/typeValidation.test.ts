import fs from 'fs';
import path from 'path';

/**
 * This test validates that components follow type safety patterns
 * It reads the actual source code and checks for common type-safety patterns
 */
describe('TypeScript schema validation', () => {
  // An array to store all component files paths
  const componentFiles: string[] = [];
  
  // Before running tests, find all component files
  beforeAll(() => {
    try {
      const componentDir = path.join(__dirname, '../../components');
      const files = fs.readdirSync(componentDir)
        .filter(file => file.endsWith('.tsx') && !file.includes('.test.'));
        
      files.forEach(file => {
        componentFiles.push(path.join(componentDir, file));
      });
    } catch (error) {
      console.error('Error reading component files:', error);
    }
  });
  
  it('finds component files to validate', () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });
  
  it('verifies all components use correct Relay type patterns', () => {
    // Skip this test if no files were found
    if (componentFiles.length === 0) {
      // Early return prevents conditional expect
      return;
    }
    
    // Track overall test result
    let allPatternsCorrect = true;
    const problemFiles: string[] = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // Check if file uses useLazyLoadQuery
      if (content.includes('useLazyLoadQuery')) {
        // Expect either ['response'] pattern or ResponseType utility
        const usesResponsePattern = new RegExp('useLazyLoadQuery<.*\\[\'response\'\\]>').test(content);
        const usesResponseTypeUtil = content.includes('ResponseType<') && 
          content.includes('import { ResponseType }');
          
        const hasCorrectPattern = usesResponsePattern || usesResponseTypeUtil;
        if (!hasCorrectPattern) {
          console.error(`${filename} should use proper Relay type pattern for useLazyLoadQuery`);
          allPatternsCorrect = false;
          problemFiles.push(filename);
        }
      }
    });
    
    // Single expect statement at the end, not conditional
    expect(allPatternsCorrect).toBe(true);
    if (!allPatternsCorrect) {
      console.error('Files with incorrect patterns:', problemFiles.join(', '));
    }
  });
  
  it('verifies proper edge handling in all components', () => {
    // Skip this test if no files were found
    if (componentFiles.length === 0) {
      // Early return prevents conditional expect
      return;
    }
    
    // Track overall test result
    let allEdgeHandlingCorrect = true;
    const problemFiles: string[] = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // If the component maps over edges, it should properly handle them
      if (content.includes('.edges.map')) {
        // Should either have typed parameter or null check
        const hasTypedEdge = new RegExp('\\.map\\(\\(edge: .*\\) =>').test(content);
        const hasNullCheck = content.includes('if (!edge || !edge.node)');
        
        const hasCorrectEdgeHandling = hasTypedEdge || hasNullCheck;
        if (!hasCorrectEdgeHandling) {
          console.error(`${filename} should properly type or check edges when mapping`);
          allEdgeHandlingCorrect = false;
          problemFiles.push(filename);
        }
      }
    });
    
    // Single expect statement at the end, not conditional
    expect(allEdgeHandlingCorrect).toBe(true);
    if (!allEdgeHandlingCorrect) {
      console.error('Files with incorrect edge handling:', problemFiles.join(', '));
    }
  });
}); 