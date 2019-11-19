
export class Method {

    constructor(name, path, startLine, endLine, returnType) {
        this.name = name;
        this.path = path;
        this.startLine = startLine;
        this.endLine = endLine;
        this.returnType = returnType;
    }

    name: string;
    path: string;
    startLine: number;
    endLine: number;
    returnType: string;
}
