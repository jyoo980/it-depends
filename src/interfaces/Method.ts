/**
 * Represents a Java method and its properties.
 */
export class Method {
    name: string;
    startLine: number;
    endLine: number;
    returnType: string;
    file: string; // which file path this method is in
    commitsChangedIn: string[]; // previous commits this method was changed in

    constructor(name, file, startLine, endLine, returnType) {
        this.name = name;
        this.file = file;
        this.startLine = startLine;
        this.endLine = endLine;
        this.returnType = returnType;
        this.commitsChangedIn = [];
    }

    /**
     * Adds the given commit sha to the collection of commits this method has been changed in
     *
     * @param commitSha the sha of the commit this method was changed in
     */
    addCommitChangedIn(commitSha: string) {
        this.commitsChangedIn.push(commitSha);
    }

    /**
     * Returns an identifier as the combination of the file path to this method and the method name
     *
     * Used to distinguish methods as well as maintain a dictionary of methods for efficient method updating
     */
    getIdentifier(): string {
        return `${this.file}/${this.name}`;
    }
}
