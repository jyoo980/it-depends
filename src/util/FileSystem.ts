import * as fs from "fs-extra";
import * as JSZip from "JSZip";
import * as dash from "lodash";

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

    public async writeRepoToDisk(dir: string, repoName: string, contentAsBuf: any): Promise<string> {
        const fullPath: string = `${dir}/${repoName}-PARSED.txt`;
        try {
            const repoAsZip = await JSZip.loadAsync(contentAsBuf);
            const repoContents = repoAsZip.files;
            const repoFiles = Object.values(repoContents).filter((content) => this.isJavaFile(content));
            const fileNames: string[] = repoFiles.map((file) => this.getFileName(file.name));
            const filesToText: Array<Promise<string>> = repoFiles.map((file) => file.async("text"));
            const filesAsText = await Promise.all(filesToText);
            const fileNamesToContent: { [key: string]: string } = dash.zipObject(fileNames, filesAsText);
            const dataToSave = JSON.stringify(fileNamesToContent);
            await fs.writeFile(fullPath, dataToSave);
            return fullPath;
        } catch (err) {
            console.log(`FileSystem::failed to write repo: ${repoName} to disk`);
            throw err;
        }
    }

    public async readRepoFromDisk(dir: string, repoName: string): Promise<any> {
        const fullPath: string = `${dir}/${repoName}-PARSED.txt`;
        try {
            const dataAsString = await fs.readFile(fullPath, "utf-8");
            return JSON.parse(dataAsString);
        } catch (err) {
            console.log(`FileSystem::failed to read repo: ${repoName} from disk`);
            throw err;
        }
    }

    private isJavaFile(content: any): boolean {
        return !content.dir && content.name.includes(".java");
    }

    private getFileName(fullPath: string): string {
        const lastSlashIndex: number = fullPath.lastIndexOf("/");
        return fullPath.substring(lastSlashIndex + 1);
    }
}
