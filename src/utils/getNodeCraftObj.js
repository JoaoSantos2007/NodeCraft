import Propreties from './Properties.js';

const getNodeCraftObj = (path, id, version, { name }) => {
  const properties = Propreties.getPropertiesListLocal(path);
  properties['level-name'] = 'world';

  const settings = {
    id,
    name,
    version,
    properties,
  };

  return settings;
};

export default getNodeCraftObj;
