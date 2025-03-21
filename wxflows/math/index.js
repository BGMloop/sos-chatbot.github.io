// Math calculator tool implementation using wxflows

// Import required tools
import { executeGraphQL } from '../../lib/graphql-client';

/**
 * Math calculator tool using Wolfram Alpha
 * @param {Object} params - Parameters for the calculation
 * @param {string} params.input - Math expression or question to calculate
 * @returns {Object} - Result object
 */
export async function mathCalculator(params) {
  try {
    // Extract input from parameters
    const { input } = params;
    
    if (!input) {
      return {
        error: "Missing required parameter: input",
        status: "error"
      };
    }
    
    try {
      // Execute the GraphQL query
      const result = await executeGraphQL({
        query: `
          query CalculateMath($input: String!) {
            wolframAlpha(input: $input) {
              result
            }
          }
        `,
        variables: { input }
      });
      
      // Handle potential errors
      if (!result || !result.wolframAlpha) {
        throw new Error('Failed to get calculation result');
      }
      
      return {
        result: result.wolframAlpha.result,
        status: "success"
      };
    } catch (graphqlError) {
      // For simple calculations, fallback to local evaluation if Wolfram fails
      if (isSimpleCalculation(params.input)) {
        try {
          console.log("Using local calculation fallback");
          const result = localCalculate(params.input);
          return {
            result: result,
            status: "success",
            source: "local"
          };
        } catch (localError) {
          // If local calculation also fails, throw to the outer catch
          console.error("Local calculation also failed:", localError);
          throw localError;
        }
      } else {
        // For complex queries, pass through the GraphQL error
        throw graphqlError;
      }
    }
  } catch (error) {
    console.error("Math calculator error:", error);
    
    return {
      error: error.message || "An error occurred while calculating",
      status: "error"
    };
  }
}

/**
 * Checks if an input string is a simple calculation that can be handled locally
 * @param {string} input - Input string to check
 * @returns {boolean} - Whether the input is a simple calculation
 */
function isSimpleCalculation(input) {
  // Regex to match basic arithmetic operations
  const simpleExpressionRegex = /^[\d\s\+\-\*\/\(\)\.\,\%\^]+$/;
  return simpleExpressionRegex.test(input);
}

/**
 * Calculate a simple expression locally (fallback method)
 * @param {string} input - Simple math expression
 * @returns {number} - Calculated result
 */
function localCalculate(input) {
  // Safety check - only allow safe characters
  if (!/^[\d\s\+\-\*\/\(\)\.\,\%\^]+$/.test(input)) {
    throw new Error('Invalid input for local calculation');
  }
  
  // Replace ^ with ** for exponentiation
  const sanitizedInput = input.replace(/\^/g, '**');
  
  // Use Function constructor to evaluate the expression
  return Function('"use strict";return (' + sanitizedInput + ')')();
}

// Export the default function
export default mathCalculator; 