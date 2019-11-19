import * as fs from "fs-extra";
import {join} from "path";

export class JavaFileSystem {
    /**
     * Returns true if the given path is a directory, false otherwise
     *
     * @param path the path to check
     */
    public isDirectory(path): boolean {
        return fs.statSync(path).isDirectory();
    }

    /**
     * Returns an array of the paths of directories in the given location
     *
     * @param path the location to get the directories from
     */
    public getDirectories(path): string[] {
        return fs.readdirSync(path).map(name => join(path, name)).filter((item) => this.isDirectory(item));
    }

    /**
     * Returns true if the given path is a Java file, false otherwise
     *
     * @param path the path to check
     */
    public isJavaFile(path): boolean {
        let javaRegexp = RegExp(".*.java");
        return fs.statSync(path).isFile() && javaRegexp.test(path);
    }

    /**
     * Returns an array of the paths of Java files in the given location
     *
     * @param path the location to get the Java files from
     */
    public getJavaFiles(path): string[] {
        return fs.readdirSync(path).map(name => join(path, name)).filter((item) => this.isJavaFile(item));
    }

    /**
     * Returns an array of the all Java files, recursively, in a path
     *
     * @param path the location to get all Java files recursively from
     */
    public getJavaFilesRecursively(path) {
        let dirs = this.getDirectories(path);
        let files = dirs
            .map(dir => this.getJavaFilesRecursively(dir)) // go through each directory
            .reduce((a,b) => a.concat(b), []);    // map returns a 2d array (array of file arrays) so flatten
        return files.concat(this.getJavaFiles(path));
    }
}
