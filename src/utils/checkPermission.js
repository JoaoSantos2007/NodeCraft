import Instance from '../services/Instance.js';
import Link from '../services/Link.js';

const checkPermission = async (user, permission, id) => {
  if (permission === 'logged') return true;
  if (user.admin) return true;
  if (permission === 'admin') return false;

  // Verify player have permission on instance
  if (permission.split(':')[0] === 'instance') {
    const instance = await Instance.readOne(id);

    // Verify if user is owner of the instance
    if (instance.owner === user.id) return true;

    // Verify if user has any link with instance
    const permissions = await Link.readUserPermissions(user.id, id);
    if (!permissions) return false;
    if (permissions?.includes(permission)) return true;

    return false;
  }

  return false;
};

export default checkPermission;
