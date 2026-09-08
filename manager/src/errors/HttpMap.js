import Base from './Base.js';
import InvalidRequest from './InvalidRequest.js';
import Unathorized from './Unathorized.js';
import Forbidden from './Forbidden.js';
import NotFound from './NotFound.js';
import PayloadTooLarge from './PayloadTooLarge.js';
import TooManyRequests from './TooManyRequests.js';

const CLIENT_ERRORS = {
  400: InvalidRequest,
  401: Unathorized,
  403: Forbidden,
  404: NotFound,
  413: PayloadTooLarge,
  429: TooManyRequests,
};

const mapHttpError = (error) => {
  if (error?.expose !== true) return null;

  const status = Number(error.status ?? error.statusCode);
  if (!Number.isInteger(status) || status < 400 || status > 499) return null;

  const ClientError = CLIENT_ERRORS[status];
  if (ClientError) return new ClientError(error.message);

  return new Base('You sent an invalid request!', status, 'INVALID_REQUEST', error.message);
};

export default mapHttpError;
