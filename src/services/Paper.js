import shell from 'shelljs';
import curl from '../utils/curl.js';

class Paper {
  static async getDownloadUrl(version = null) {
    if (!version) {

    }

    return downloadUrl;
  }

  static async install(path, version) {
    const downloadUrl = await Paper.getDownloadUrl(version);
    const downloadFile = 'server.jar';
    // Download server.jar
    shell.exec(`${curl()} -o ${path}/${downloadFile} ${downloadUrl}`, { silent: true });
  }
}

export default Paper;
