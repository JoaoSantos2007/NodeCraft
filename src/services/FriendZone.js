import NodeCraft from './NodeCraft.js';

class FriendZone {
  static async read(id) {
    const instance = NodeCraft.read(id);
    return instance.friendZone;
  }

  static async add(id){
    
  }
}

export default FriendZone;
