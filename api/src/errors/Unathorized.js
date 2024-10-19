import Base from './Base.js';

class Unathorized extends Base {
  constructor(message = 'Unathorized!', status = 401) {
    super(message, status);
  }
}

export default Unathorized;
