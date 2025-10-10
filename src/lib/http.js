/**
 * HTTP helper utilities for API routes
 */

/**
 * Returns a JSON response with proper headers
 * @param {any} data - Data to serialize
 * @param {number|object} init - Status code or Response init options
 */
export function json(data, init = 200) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : (init.status ?? 200),
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });
}

/**
 * Returns an error response with proper structure
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} extra - Additional fields to include in response
 */
export function err(message, status = 400, extra = {}) {
  return json({ error: message, ...extra }, status);
}

/**
 * Method guard - returns 405 if method not allowed
 * @param {string[]} methods - Allowed HTTP methods
 * @returns {function} Request handler
 */
export function allow(methods = []) {
  return (req) => {
    if (!methods.includes(req.method)) {
      return new Response(null, {
        status: 405,
        headers: { 'Allow': methods.join(', ') }
      });
    }
    return null;
  };
}
