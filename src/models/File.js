const File = {
  type: {
    type: 'string',
    required: true,
    values: ['file', 'dir'],
  },
  content: {
    type: 'string',
  },
};

export default File;
