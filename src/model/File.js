const File = {
  type: {
    type: 'string',
    required: true,
    values: ['file', 'dir'],
  },
  name: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
  },
};

export default File;
