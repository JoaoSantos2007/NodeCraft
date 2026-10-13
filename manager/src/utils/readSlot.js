import config from '../../config/config.js';
import { ServiceUnavailable } from '../errors/index.js';

let active = 0;

// Hold the slot until both I/O and the response have finished, including aborts.
export default function acquireReadSlot(res) {
  if (active >= config.files.maxConcurrentReads) throw new ServiceUnavailable('Too many file reads; try again shortly.');
  active += 1;

  let operationDone = false;
  let responseDone = res.destroyed || res.writableFinished;
  let released = false;
  let onResponseDone;

  const release = () => {
    if (operationDone && responseDone && !released) {
      released = true;
      active -= 1;
      res.removeListener('finish', onResponseDone);
      res.removeListener('close', onResponseDone);
    }
  };

  onResponseDone = () => { responseDone = true; release(); };

  res.once('finish', onResponseDone);
  res.once('close', onResponseDone);

  return () => { operationDone = true; release(); };
}
