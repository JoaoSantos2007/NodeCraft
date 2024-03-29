import UserService from '../services/User.js';

class User {
  static async read(req, res, next) {
    try {
      const { user } = req;
      return res.status(200).json({ success: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async readMany(req, res, next) {
    try {
      const users = await UserService.readUsers();

      return res.status(200).json({ success: true, users });
    } catch (err) {
      return next(err);
    }
  }

  static async readById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.readUserById(id);

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const data = req.body;
      const user = await UserService.register(data);

      return res.status(201).json({ success: true, created: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, gamertag } = req.body;
      const { user } = req;
      const userUpdated = await UserService.updateUser(user.id, { name, gamertag });

      return res.status(200).json({ success: true, updated: true, user: userUpdated });
    } catch (err) {
      return next(err);
    }
  }

  static async updateOther(req, res, next) {
    try {
      // eslint-disable-next-line object-curly-newline
      const { name, gamertag, role, email } = req.body;
      const { id } = req.params;

      // eslint-disable-next-line object-curly-newline
      const user = await UserService.updateUser(id, { name, gamertag, role, email });

      return res.status(200).json({ success: true, updated: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { user } = req;
      await UserService.deleteUser(user.id);

      return res.status(200).json({ success: true, deleted: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteOther(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.deleteUser(id);

      return res.status(200).json({ success: true, deleted: true, user });
    } catch (err) {
      return next(err);
    }
  }

  static async;
}

export default User;
