import Base from './Base.js';

class InvalidRequest extends Base {
  constructor(message = 'Invalid Request', status = 400) {
    super(message, status);
  }
}

export default InvalidRequest;
