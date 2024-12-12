import Base from './Base.js';

class BadRequest extends Base {
  constructor(message = 'Item not found', status = 404) {
    super(message, status);
  }
}

export default BadRequest;
