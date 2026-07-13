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
 * Returns a response for a Supabase/PostgREST error, mapping the Postgres error
 * code to a status so bad input is not reported as a server fault.
 * @param {object} error - Supabase error ({ code, message, details, hint })
 * @param {number} fallback - Status to use for codes with no specific mapping
 */
export function dbError(error, fallback = 500) {
  const code = error?.code ?? null;

  let status = fallback;
  if (code === 'PGRST116') status = 404;        // no rows returned by .single()
  else if (code === '23505') status = 409;      // unique violation
  else if (code === '23503') status = 409;      // foreign key violation
  else if (code === '23502') status = 400;      // not-null violation
  else if (code === '23514') status = 400;      // check constraint violation
  else if (code?.startsWith('22')) status = 400; // data exception, e.g. 22007 bad time

  return json(
    {
      error: status >= 500 ? 'DB error' : 'Invalid data',
      code,
      message: error?.message ?? null,
      details: error?.details ?? null,
      hint: error?.hint ?? null,
    },
    status
  );
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
