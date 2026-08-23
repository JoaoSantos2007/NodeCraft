import Base from './Base.js';

class TooManyRequests extends Base {
  constructor(details = []) {
    super('Too many requests, try again later!', 429, 'TOO_MANY_REQUESTS', details, null);
  }
}

export default TooManyRequests;
