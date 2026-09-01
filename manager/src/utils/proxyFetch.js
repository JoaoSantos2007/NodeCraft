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
