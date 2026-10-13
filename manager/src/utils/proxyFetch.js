import { ServiceUnavailable, PayloadTooLarge, Internal } from '../errors/index.js';
import getWorkerContext from './getWorkerContext.js';
import config from '../../config/config.js';

const workerTimeout = config.worker.timeout;
// A 1 MiB preview can expand sixfold when JSON escapes control characters.
const MAX_JSON_BYTES = 8 * 1024 * 1024;

// Native fetch cancellation also applies while its response body is being read.
async function proxyFetch(route, { streaming = false, signal, ...options } = {}) {
  try {
    const timeout = streaming ? null : AbortSignal.timeout(workerTimeout);
    const requestSignal = signal && timeout
      ? AbortSignal.any([signal, timeout]) : signal || timeout;
    return await fetch(route, { ...options, signal: requestSignal });
  } catch {
    throw new ServiceUnavailable(
      'Worker communication failed or timed out. The operation may have been accepted; check its status before retrying.',
    );
  }
}

async function discardWorkerResponse(response) {
  await response.body?.cancel();
}

async function proxyToWorker(id, {
  route,
  method = 'GET',
  body,
  headers,
  streaming = false,
  diskBudgetBytes,
}) {
  const { worker } = await getWorkerContext(id);

  const options = {
    method,
    streaming,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      Authorization: `Bearer ${worker.secret}`,
      ...(diskBudgetBytes === undefined ? {} : { 'X-Disk-Budget-Bytes': String(diskBudgetBytes) }),
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
  let body;
  try {
    if (Number(response.headers.get('content-length')) > MAX_JSON_BYTES) {
      await response.body?.cancel();
      throw new PayloadTooLarge('Worker response exceeds the 8 MiB JSON limit.');
    }

    const chunks = [];
    let bytes = 0;
    if (response.body) {
      for await (const chunk of response.body) {
        bytes += chunk.byteLength;
        if (bytes > MAX_JSON_BYTES) {
          throw new PayloadTooLarge('Worker response exceeds the 8 MiB JSON limit.');
        }

        chunks.push(Buffer.from(chunk));
      }
    }

    body = Buffer.concat(chunks, bytes).toString('utf8');
  } catch (err) {
    if (err instanceof PayloadTooLarge) throw err;

    throw new ServiceUnavailable(
      'Worker communication failed or timed out. The operation may have been accepted; check its status before retrying.',
    );
  }
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

export {
  readWorkerJson, proxyToWorker, sendWorkerJson, discardWorkerResponse,
};
export default proxyFetch;
