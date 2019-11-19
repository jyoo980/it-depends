import * as fs from "fs-extra";
import {Method} from "../interfaces/Method";
import {JavaFileSystem} from "../util/JavaFileSystem";
const path = require("path");

export default class MethodParser {

    private readonly javaFileSystem: JavaFileSystem;

    constructor() {
        this.javaFileSystem = new JavaFileSystem();
    }

    /**
     * Returns all the Java Methods in the given path to project
     *
     * @param projectPath the path to the project to check
     */
    public getMethodsFromProject(projectPath): Method[] {
        let dirFiles = this.javaFileSystem.getJavaFilesRecursively(path.resolve(__dirname, projectPath));

        let allMethods: Method[] = [];

        for (let file of dirFiles) {
            let methods = this.getMethodsFromJavaFile(file);
            allMethods = allMethods.concat(methods);
        }

        return allMethods;
    }

    /**
     * Returns all the Java Methods in the given Java file
     *
     * @param javaPath the path to the Java file to check
     */
    public getMethodsFromJavaFile(javaPath): Method[] {
        let javaFileString = fs.readFileSync(javaPath).toString().split("\r\n");

        let regexp = RegExp("^(\\t|    )(public|private)( )(static )?([\\w\\d<>]* )[\\w\\d_.-]+((\\((( )*[\\w\\d\\[\\]_.-]+ [\\w\\d_.-]+,?)*\\))) {$");
        let endMethodRegexp = RegExp("^(\\t|    )}$");

        let methods: Method[] = [];

        let lineNumber = 1;
        for (let line of javaFileString) {
            // Found a method!
            if (regexp.test(line)) {
                methods.push(this.parseMethodSignature(line, javaPath, lineNumber));
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
     * @param filePath the path to the file this method belongs to
     * @param startLine the line number this method begins in
     */
    public parseMethodSignature(methodSignature: string, filePath: string, startLine: number): Method {
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

        return new Method(methodName, filePath, startLine, 0, returnType);
    }
}
