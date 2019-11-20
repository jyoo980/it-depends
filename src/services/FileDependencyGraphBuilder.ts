import FileSystem from "../util/FileSystem";
import {DependencyTypes} from "../rest/DependenciesCtrl";

export default class FileDependencyGraphBuilder {
    private fileSystem: FileSystem;

    constructor() {
        this.fileSystem = new FileSystem();
    }
    // get file

    public async getDependenciesFromProject(directory: string, repoName: string): Promise<any> {
        let contents = await this.fileSystem.readRepoFromDisk(directory, repoName);
        let fileNames = Object.keys(contents).map(name => name.replace(/.java+$/, ""));
        console.log("length: " + fileNames.length);
        let dependencyData = new Array(fileNames.length).fill(new Array(fileNames.length).fill(new Array()));

        let dependencyMatrix = {
            names: fileNames,
            data: dependencyData
        };
        for(let file in contents) {
            let fileName = file.replace(/.java+$/, "");
            let dependenciesToSearch = fileNames.filter((name) => {
                return name !== fileName;
            });
            let dependenciesInFile = this.getDependenciesFromFile(contents[file], dependenciesToSearch);

            dependenciesInFile.forEach((dep) => {
                let from = fileNames.indexOf(fileName);
                let to = fileNames.indexOf((dep));
                console.log("from");
                console.log(fileName);
                console.log("to");
                console.log(dep);
                console.log(fileNames.indexOf((dep)));
                // console.log(fileName);
                // console.log(dependencyMatrix.data[fileNames.indexOf(fileName)][fileNames.indexOf((dep))]);
                dependencyData[from][to] = [DependencyTypes.References];
            });

            // [       0    1   2                       3   4
            //     0 [[], [], [DependencyTypes.Calls], [], []],
            //     1 [[], [], [DependencyTypes.Calls], [], []],
            //     2 [[], [], [], [], [DependencyTypes.References]],
            //     3 [[DependencyTypes.References], [], [], [], []],
            //     4 [[], [], [], [], []],
            // ]
        }

        // console.log(dependencyMatrix.names);
        console.log(dependencyData[0].length);
        console.log(dependencyData[0]);
        // console.log(fileNames);
        // console.log(contents);

        return dependencyMatrix;
    }

    /**
     * Gets all of the mentions of other files in a file's contents.
     *
     * @param fileContents
     * @param self
     * @param fileNames
     *
     */
    public getDependenciesFromFile(fileContents: string, fileNames: string[]) {
        let fileLines = fileContents.split("\n");
        let importRegex = RegExp("^(\\t|    )?import");

        let dependencies = [];

        fileLines.forEach((line: string) => {
            // skip any import statements
            if(importRegex.test(line)) {
                return;
            }

            // skip comments
            // TODO

            // check whether dependency exists.
            fileNames.forEach((name: string) => {
                // Don't have to record same type of dependency multiple times
                if(dependencies.includes(name)) {
                    return;
                }

                let spaceRegex = RegExp("( " + name + "|" + name + " )");
                let brackRegex = RegExp("(\\(" + name + " )");
                let collRegex = RegExp("<"+name+">");
                if(spaceRegex.test(line) || brackRegex.test(line) || collRegex.test(line)) {
                    dependencies.push(name);
                }
            });
        });

        return dependencies;

    }
}