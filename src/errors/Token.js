import Base from './Base.js';

class Token extends Base {
  constructor(message = 'Token is invalid!', status = 400) {
    super(message, status);
  }
}

export default Token;
