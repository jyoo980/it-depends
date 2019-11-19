import * as fs from "fs-extra";
import * as JSZip from "JSZip";

export interface FileSystemError extends Error {
    message: string,
}

export default class FileSystem {

    public async write(dir: string, fileName: string, content: string): Promise<string> {
        const fullPath: string = `${dir}/${fileName}`;
        try {
            await fs.mkdir(dir);
            await fs.writeFile(fullPath, content);
            return fullPath;
        } catch (err) {
            console.warn(`FileSystem::write failed with error: ${err}`);
            throw { message: err.message } as FileSystemError;
        }
    }

    public async read(dir: string, fileName: string): Promise<string> {
        const fullPath: string = `${dir}/${fileName}`;
        try {
            return await fs.readFile(fullPath, "utf-8");
        } catch (err) {
            console.warn(`FileSystem::read failed with error: ${err}`);
            throw { message: err.message } as FileSystemError;
        }
    }

    public async isOnDisk(dir: string, fileName: string): Promise<boolean> {
        const fullPath: string = `${dir}/${fileName}`;
        try {
            return await fs.pathExists(fullPath);
        } catch (err) {
            console.log(`FileSystem::${fullPath} appears to not exist`);
            return false;
        }
    }

    public async writeAsZip(dir: string, repoName: string, contentAsBuf: any): Promise<string> {
        const fullPath: string = `${dir}/${repoName}.zip`;
        return new Promise((resolve, reject) => {
            JSZip.loadAsync(contentAsBuf)
                .then((zip) => {
                    zip.generateNodeStream({ streamFiles:true })
                        .pipe(fs.createWriteStream(fullPath))
                        .on('finish', () => resolve(fullPath))
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }
}
