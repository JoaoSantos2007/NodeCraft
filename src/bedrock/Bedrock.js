import shell from 'shelljs';
import crypto from 'crypto';
import curl from '../utils/curl.js';

const absolutePath = shell.pwd().stdout;
const tempsPath = `${absolutePath}/temp`;
const instancesPath = `${absolutePath}/instances`;

class Bedrock {
  static async createInstance({ name }) {
    // Create New Instance Path
    const newInstancePath = `${instancesPath}/${name}`;
    shell.mkdir(newInstancePath);

    // Create Temp path
    const randomUUID = crypto.randomUUID();
    const tempPath = `${tempsPath}/${randomUUID}`;
    shell.mkdir(tempPath);

    // Get Minecraft Bedrock Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://minecraft.net/en-us/download/server/bedrock/`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Download Minecraft Bedrock .zip
    const DownloadFile = 'bedrock-server-latest.zip';
    shell.exec(`${curl()} -o ${tempPath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Unzip File
    shell.exec(`unzip ${tempPath}/${DownloadFile} -d ${newInstancePath}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);
  }
}

export default Bedrock;
