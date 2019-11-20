import {Method} from "../interfaces/Method";
import FileSystem from "../util/FileSystem";

export default class MethodParser {

    private readonly fileSystem: FileSystem;

    constructor() {
        this.fileSystem = new FileSystem();
    }

    /**
     * Returns all the Java Methods in the given directory and repo name
     *
     * @param dir the directory to the repo file
     * @param repoName the name of the repository
     */
    public async getMethodsFromProject(dir, repoName): Promise<Method[]> {
        let repoObject;
        let allMethods: Method[] = [];

        repoObject = await this.fileSystem.readRepoFromDisk(dir, repoName);
        for (let fileName in repoObject) {
            allMethods = allMethods.concat(this.getMethodsFromJavaFile(repoObject[fileName]));
        }

        return allMethods;
    }

    /**
     * Returns all the Java Methods in the given Java file
     *
     * @param javaFileString the Java file, in string form
     */
    public getMethodsFromJavaFile(javaFileString): Method[] {
        let javaFileStringArr = javaFileString.split("\n");

        let regexp = RegExp("^(\\t|    )(public|private)( )(static )?([\\w\\d<>]* )+[\\w\\d_.-]+((\\((( )*[\\w\\d\\[\\]<>,_.-]+ [\\w\\d_.-]+,?)*\\))) {$");
        let endMethodRegexp = RegExp("^(\\t|    )}$");

        let methods: Method[] = [];

        let lineNumber = 1;
        for (let line of javaFileStringArr) {
            // Found a method!
            if (regexp.test(line)) {
                methods.push(this.parseMethodSignature(line, lineNumber));
            }

            // Found the end of the latest method found, update its endLine
            if (endMethodRegexp.test(line) && methods.length > 0) {
                methods[methods.length - 1].endLine = lineNumber;
            }

            lineNumber++;
        }

        return methods;
    }

    /**
     * Parses the given Java method signature and returns a Method
     *
     * @param methodSignature the method signature to parse
     * @param startLine the line number this method begins in
     */
    public parseMethodSignature(methodSignature: string, startLine: number): Method {
        let tokens = methodSignature.split(" ");
        let index = 0;
        let tabLevel: number = 0;
        let returnType: string = "";
        let methodName: string = "";

        while (index < methodSignature.length) {
            // Extract tab level of method signature
            while (tokens[index] === '') {
                index++;
                tabLevel++;
            }

            // Toss access modifier out, if any
            if (tokens[index] === "public" || tokens[index] === "private" || tokens[index] === "protected") {
                index++;
                continue;
            }

            // Toss static out, if any
            if (tokens[index] === "static") {
                index++;
                continue;
            }

            // Get return type, must exist
            if (returnType === "") {
                returnType = tokens[index];
                index++;
                continue;
            }

            // Get method name, must exist
            if (methodName === "") {
                methodName = tokens[index].split("(")[0]; // extract from paren
                index++;
                continue;
            }

            index++
        }

        return new Method(methodName, startLine, 0, returnType);
    }
}
