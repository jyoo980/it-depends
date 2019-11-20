export class Method {
    // TODO: May need to have return types, and path to distinguish difference between multiple methods
    name: string;
    startLine: number;
    endLine: number;
    returnType: string;
    file: string; // which file this method is in
    commitsChangedIn: string[]; // previous commits this method was changed in

    constructor(name, file, startLine, endLine, returnType) {
        this.name = name;
        this.file = file;
        this.startLine = startLine;
        this.endLine = endLine;
        this.returnType = returnType;
        this.commitsChangedIn = [];
    }

    addCommitChangedIn(commitSha: string) {
        this.commitsChangedIn.push(commitSha);
    }

    getIdentifier(): string {
        return `${this.file}/${this.name}`;
    }
}
