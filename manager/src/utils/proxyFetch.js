import { ServiceUnavailable, PayloadTooLarge, Internal } from '../errors/index.js';

async function proxyFetch(route, options) {
  let response;

  try {
    response = await fetch(route, options);
  } catch {
    throw new ServiceUnavailable('Worker is not responding!');
  }

  return response;
}

/**
 * Reads a worker response as JSON without trusting it to be JSON.
 *
 * Whatever sits between the manager and the worker (nginx, a load balancer) can
 * answer in its place with an HTML error page — an upload above nginx's
 * `client_max_body_size` comes back as a 413 page, never reaching the worker.
 * Calling response.json() on that throws a raw SyntaxError, which the user sees
 * as a generic 500. Turn it into the status that actually happened instead.
 */
async function readWorkerJson(response) {
  const body = await response.text();

  try {
    return JSON.parse(body);
  } catch {
    if (response.status === 413) throw new PayloadTooLarge('The worker refused the file size');

    if (response.ok) throw new Internal('Worker answered an unreadable response!');

    throw new ServiceUnavailable(`Worker answered ${response.status} with an unreadable body`);
  }
}

export { readWorkerJson };
export default proxyFetch;
