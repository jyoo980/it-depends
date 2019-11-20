import AbstractDependencyGraphBuilder from "./AbstractDependencyGraphBuilder";
import {DependencyMatrix, DependencyTypes} from "../model/DependencyMatrix";

export default class FileDependencyGraphBuilder extends AbstractDependencyGraphBuilder {

    /**
     * Gets all mentions of other files inside files of a project
     *
     * @param directory     directory to store repository contents
     * @param repoName      url of repository to pull down
     * @returns any
     *
     */
    public async getDependenciesFromProject(directory: string, repoUrl: string): Promise<DependencyMatrix> {
        let contents = await this.fileSystem.readRepoFromDisk(directory, repoUrl);
        let fileNames = Object.keys(contents).map(name => name.replace(/.java+$/, ""));
        let dependencyData = this.initializeEmptyMatrix(fileNames.length);

        let dependencyMatrix = new DependencyMatrix();
        dependencyMatrix.names = fileNames;

        for(let file in contents) {
            let fileName = file.replace(/.java+$/, "");
            let dependenciesToSearch = fileNames.filter((name) => {
                return name !== fileName;
            });
            let dependenciesInFile = this.getDependenciesFromFile(contents[file], dependenciesToSearch);

            dependenciesInFile.forEach((dep) => {
                let from = fileNames.indexOf(fileName);
                let to = fileNames.indexOf(dep);
                dependencyData[from][to].push(DependencyTypes.References);
            });
        }
        dependencyMatrix.data = dependencyData;
        return dependencyMatrix;
    }

    /**
     * Gets all of the mentions of other files in a file's contents.
     *
     * @param fileContents  a string representing the file's contents
     * @param fileNames     a list of all file names inside the directory, excluding the file which is being parsed here
     * @returns string[]    list of dependencies in file.
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

                // TODO: possibly clean this up
                let spaceRegex = RegExp("( " + name + "|" + name + " )");
                let brackRegex = RegExp("(\\(" + name + " )");
                let collRegex = RegExp("<" + name + "|" + name + ">");
                if(spaceRegex.test(line) || brackRegex.test(line) || collRegex.test(line)) {
                    dependencies.push(name);
                }
            });
        });
        return dependencies;
    }
}