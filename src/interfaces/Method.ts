export class Method {
    // TODO: May need to have return types, and path to distinguish difference between multiple methods
    name: string;
    startLine: number;
    endLine: number;
    returnType: string;

    constructor(name, startLine, endLine, returnType) {
        this.name = name;
        this.startLine = startLine;
        this.endLine = endLine;
        this.returnType = returnType;
    }
}
