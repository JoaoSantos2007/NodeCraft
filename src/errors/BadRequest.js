import Base from './Base.js';

class BadRequest extends Base {
  constructor(message = 'Item not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export default BadRequest;
