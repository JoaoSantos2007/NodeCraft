import Base from './Base.js';

class PayloadTooLarge extends Base {
  constructor(details = []) {
    super('The file operation exceeds its disk limit!', 413, 'PAYLOAD_TOO_LARGE', details);
  }
}

export default PayloadTooLarge;
