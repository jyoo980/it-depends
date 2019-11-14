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
}
