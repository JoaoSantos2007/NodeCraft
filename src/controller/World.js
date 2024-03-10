import WorldService from '../services/World.js';

class World {
  static async download(req, res, next) {
    try {
      const { id } = req.params;
      const worldType = req.query?.world;
      const path = await WorldService.download(id, worldType);

      return res.download(path);
    } catch (err) {
      return next(err);
    }
  }

  static async upload(req, res, next) {
    try {
      const { id } = req.params;
      const { upload } = req;
      const worldType = req.query?.world;
      const instance = await WorldService.upload(id, upload, worldType);

      return res.status(200).json({ success: true, uploaded: true, instance });
    } catch (err) {
      return next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const worldType = req.query?.world;
      const instance = await WorldService.delete(id, worldType);

      return res.status(200).json({ success: true, deleted: true, instance });
    } catch (err) {
      return next(err);
    }
  }
}

export default World;
