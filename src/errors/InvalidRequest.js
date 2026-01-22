import Base from './Base.js';

class InvalidRequest extends Base {
  constructor(message = 'Invalid Request', details = []) {
    super(message, 400, 'INVALID_REQUEST', details, null);
  }
}

export default InvalidRequest;
