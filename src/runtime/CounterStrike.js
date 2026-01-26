import Instance from './Instance.js';

class CounterStrike extends Instance {
  constructor(instance, readFunction) {
    super(instance, readFunction);

    this.setup();
  }

  async setup() {
    await this.start();

    this.listen(() => {

    });
  }
}

export default CounterStrike;
