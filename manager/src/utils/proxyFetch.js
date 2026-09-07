import { ServiceUnavailable, PayloadTooLarge, Internal } from '../errors/index.js';
import getWorkerContext from './getWorkerContext.js';

async function proxyFetch(route, options) {
  let response;

  try {
    response = await fetch(route, options);
  } catch {
    throw new ServiceUnavailable('Worker is not responding!');
  }

  return response;
}

async function proxyToWorker(id, {
  route,
  method = 'GET',
  body,
  headers,
}) {
  const { worker } = await getWorkerContext(id);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      Authorization: `Bearer ${worker.secret}`,
    },
  };

  if (typeof body?.pipe === 'function') {
    options.body = body;
    options.duplex = 'half';
  } else if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return proxyFetch(`${worker.url}/server/${id}${route}`, options);
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

async function sendWorkerJson(res, response, successStatus = 200) {
  const result = await readWorkerJson(response);

  return res.status(response.ok ? successStatus : response.status).json(result);
}

export { readWorkerJson, proxyToWorker, sendWorkerJson };
export default proxyFetch;
