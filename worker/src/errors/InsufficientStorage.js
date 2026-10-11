import Base from './Base.js';

class InsufficientStorage extends Base {
  constructor(details = []) {
    super('The worker has insufficient free disk space!', 507, 'INSUFFICIENT_STORAGE', details);
  }
}

export default InsufficientStorage;
