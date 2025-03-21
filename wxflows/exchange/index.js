// Currency exchange tool implementation using wxflows

// Import required tools
import { executeGraphQL } from '../../lib/graphql-client';

/**
 * Exchange tool implementation
 * @param {Object} params - Parameters for the exchange
 * @param {string} params.from - Source currency code (e.g., USD)
 * @param {string} params.to - Target currency code (e.g., EUR)
 * @param {string|number} params.amount - Amount to convert (optional, defaults to 1)
 * @returns {Object} - Result object
 */
export async function exchangeTool(params) {
  try {
    // Extract parameters
    const { from, to, amount = 1 } = params;
    
    if (!from || !to) {
      return {
        error: "Missing required parameters: 'from' and 'to' currencies are required",
        status: "error"
      };
    }
    
    // Format currencies to uppercase
    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
      return {
        error: "Invalid amount specified",
        status: "error"
      };
    }
    
    try {
      // Execute the GraphQL query
      const result = await executeGraphQL({
        query: `
          query ConvertCurrency($from: String!, $to: String!, $amount: Float) {
            exchangeRate(from: $from, to: $to, amount: $amount) {
              from
              to
              rate
              result
              timestamp
            }
          }
        `,
        variables: { 
          from: fromCurrency, 
          to: toCurrency, 
          amount: numericAmount 
        }
      });
      
      // Handle potential errors
      if (!result || !result.exchangeRate) {
        throw new Error('Failed to get exchange rate');
      }
      
      return {
        result: {
          from: result.exchangeRate.from,
          to: result.exchangeRate.to,
          amount: numericAmount,
          rate: result.exchangeRate.rate,
          converted: result.exchangeRate.result,
          date: new Date(result.exchangeRate.timestamp * 1000).toISOString()
        },
        status: "success"
      };
    } catch (graphqlError) {
      // Always use fallback if GraphQL fails, especially for auth errors
      console.log("Using fallback exchange rate API due to GraphQL error");
      return await fallbackExchangeRate(fromCurrency, toCurrency, numericAmount);
    }
  } catch (error) {
    console.error("Exchange tool error:", error);
    
    // Final fallback
    return {
      error: error.message || "An error occurred during currency conversion",
      status: "error"
    };
  }
}

/**
 * Fallback function to get exchange rates from a free API
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 * @param {number} amount - Amount to convert
 * @returns {Promise<Object>} - Conversion result
 */
async function fallbackExchangeRate(from, to, amount) {
  try {
    // Call the exchange rate API
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.result !== "success") {
      throw new Error(`Exchange rate API returned error: ${data.error || "Unknown error"}`);
    }
    
    if (!data.rates[to]) {
      return {
        error: `Currency not found: ${to}`,
        status: "error"
      };
    }
    
    const rate = data.rates[to];
    const convertedAmount = amount * rate;
    
    return {
      result: {
        from: from,
        to: to,
        amount: amount,
        rate: rate,
        converted: convertedAmount,
        date: data.time_last_update_utc,
        source: "fallback"
      },
      status: "success"
    };
  } catch (fallbackError) {
    console.error("Fallback exchange API error:", fallbackError);
    return {
      error: fallbackError.message || "An error occurred during currency conversion",
      status: "error"
    };
  }
}

// Export default
export default exchangeTool; 