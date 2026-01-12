import Base from './Base.js';

class InvalidToken extends Base {
  constructor(message = 'Token is invalid!', status = 400) {
    super(message, status);
  }
}

export default InvalidToken;
