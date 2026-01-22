const syncWithTemplate = (template, current) => {
  // Verify if template is an object
  if (typeof template !== 'object' || template === null) {
    // If settings.json exists, keep it
    return current !== undefined ? current : template;
  }

  // Keep template array
  if (Array.isArray(template)) {
    return template;
  }

  // Objects
  const result = {};

  for (const key of Object.keys(template)) {
    result[key] = syncWithTemplate(
      template[key],
      current ? current[key] : undefined,
    );
  }

  return result;
};

export default syncWithTemplate;
