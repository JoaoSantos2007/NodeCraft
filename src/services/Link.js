import { Link as Model } from '../models/index.js';

class Service {
  static async readUserLinks() {
    const links = await Model.findAll();
  }

  static async readLinks() {
    const links = await Model.findAll();

    return links;
  }

  static async createLink() {

  }

  static async updateLink() {

  }

  static async deleteLink() {

  }
}

export default Service;
