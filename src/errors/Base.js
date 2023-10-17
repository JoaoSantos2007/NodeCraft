class Base extends Error {
  constructor(message = 'Internal Server Error!', status = 500) {
    super();
    this.message = message;
    this.status = status;
  }

  send(res) {
    res.status(this.status).send({
      success: false,
      status: this.status,
      message: this.message,
    });
  }
}

export default Base;
