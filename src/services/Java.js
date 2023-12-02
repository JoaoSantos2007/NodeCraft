import shell from 'shelljs';
import crypto from 'crypto';
import fs from 'fs';
import curl from '../utils/curl.js';
import { INSTANCES_PATH, TEMPORARY_PATH } from '../utils/env.js';
import getNodeCraftObj from '../utils/getNodeCraftObj.js';

class Java {
  static async create(data) {
    // Create Temp path
    const randomUUID = crypto.randomUUID();
    const tempPath = `${TEMPORARY_PATH}/${randomUUID}`;
    shell.mkdir(tempPath);

    // Get Minecraft Java Download Url
    shell.touch(`${tempPath}/version.html`);
    shell.exec(`${curl()} -o ${tempPath}/version.html https://www.minecraft.net/en-us/download/server`, { silent: true });
    const DownloadURL = shell.exec(`grep -o 'https://piston-data.mojang.com/v1/objects/[^"]*' ${tempPath}/version.html`, { silent: true }).stdout;

    // Create New Instance Path
    const id = crypto.randomUUID();
    const newInstancePath = `${INSTANCES_PATH}/${id}`;
    shell.mkdir(newInstancePath);

    // Download Minecraft server.jar
    const DownloadFile = 'server.jar';
    shell.exec(`${curl()} -o ${newInstancePath}/${DownloadFile} ${DownloadURL}`, { silent: true });

    // Delete temp path
    shell.rm('-r', tempPath);

    // Create NodeCraft settings json
    const version = this.extractVersionFromUrl(DownloadURL);
    const settings = getNodeCraftObj(newInstancePath, id, version, data);
    const json = JSON.stringify(settings);
    fs.writeFileSync(`${newInstancePath}/nodecraft.json`, json, 'utf-8');

    // First Run
    shell.exec(`cd ${newInstancePath} && java -Xmx1024M -Xms1024M -jar server.jar nogui`, { silent: true });

    // Enable eula.txt
    fs.writeFileSync(`${newInstancePath}/eula.txt`, 'eula=true');
  }
}

export default Java;
