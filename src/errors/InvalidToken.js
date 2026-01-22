import Base from './Base.js';

class InvalidToken extends Base {
  constructor(message = 'Token is invalid!') {
    super(message, 400, 'INVALID_TOKEN');
  }
}

export default InvalidToken;
