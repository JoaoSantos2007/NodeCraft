import Base from './Base.js';

class PayloadTooLarge extends Base {
  constructor(details = []) {
    super('The file you sent is too large!', 413, 'PAYLOAD_TOO_LARGE', details);
  }
}

export default PayloadTooLarge;
