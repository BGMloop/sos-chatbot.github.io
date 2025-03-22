"use strict";
// Math calculator module for handling mathematical expressions
/**
 * Evaluates a mathematical expression
 * @param {string} expression - The math expression to evaluate
 * @returns {number|string} The result of the evaluation or an error message
 */
function calculateExpression(expression) {
    try {
        // Clean the expression and handle edge cases
        const cleanExpression = expression.trim();
        if (!cleanExpression) {
            return 'Please provide a valid math expression';
        }
        // Basic evaluation using Function constructor (use with caution)
        // This is a simplified approach for basic math operations
        const result = Function('"use strict"; return (' + cleanExpression + ')')();
        return result;
    }
    catch (error) {
        console.error('Math calculation error:', error);
        return `Error evaluating expression: ${error.message}`;
    }
}
module.exports = {
    calculateExpression
};
