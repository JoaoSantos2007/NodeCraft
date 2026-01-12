import Base from './Base.js';

class Email extends Base {
  constructor(message = 'Internal problem with the system\'s email service', status = 500) {
    super(message, status);
  }
}

export default Email;
