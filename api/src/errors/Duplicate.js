import Base from './Base.js';

class Duplicate extends Base {
  constructor(message = 'Duplicated Item', status = 400) {
    super(message, status);
  }
}

export default Duplicate;
