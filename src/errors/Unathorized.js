import Base from './Base.js';

class Unathorized extends Base {
  constructor(message = 'Unathorized!') {
    super(message, 401, 'UNATHORIZED');
  }
}

export default Unathorized;
