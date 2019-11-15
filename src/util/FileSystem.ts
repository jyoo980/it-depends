import * as fs from "fs-extra";

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
}
