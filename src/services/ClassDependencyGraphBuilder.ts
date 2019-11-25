import AbstractDependencyGraphBuilder from "./AbstractDependencyGraphBuilder";
import {DependencyMatrix, DependencyTypes} from "../model/DependencyMatrix";

export default class ClassDependencyGraphBuilder extends AbstractDependencyGraphBuilder {

    /**
     * Gets all mentions of other classes inside classes of a project
     *
     * @param directory     directory to store repository contents
     * @param repoName      url of repository to pull down
     * @param commitSha     sha of commit to base graph off of
     * @returns any
     *
     */
    public async getDependenciesFromProject(directory: string, repoUrl: string, commitSha: string): Promise<DependencyMatrix> {
        let contents = await this.fileSystem.readRepoFromDisk(directory, repoUrl, commitSha);
        let fileNames = Object.keys(contents).map((name) => {
            let lastIndexSlash = name.lastIndexOf("/");
            name = name.substring(lastIndexSlash + 1);
            return name.replace(/.java+$/, "");
        });
        let dependencyData = this.initializeEmptyMatrix(fileNames.length);
        let fileSizes = [];

        let dependencyMatrix = new DependencyMatrix();
        dependencyMatrix.names = fileNames;

        // console.log(fileNames);

        for(let file in contents) {
            let lastIndexSlash = file.lastIndexOf("/");
            let fileName = file.substring(lastIndexSlash + 1);
            fileName = fileName.replace(/.java+$/, "");
            let dependenciesToSearch = fileNames.filter((name) => {
                return name !== fileName;
            });
            let fileInfo = this.getDependenciesFromClass(contents[file], fileName, dependenciesToSearch);

            fileInfo.dependencies.forEach((depVal, depKey) => {
                let from = fileNames.indexOf(fileName);
                let to = fileNames.indexOf(depKey);
                depVal.forEach((dep) => {
                    dependencyData[from][to].push(dep);
                });
            });
            fileSizes.push(fileInfo.size);
        }
        dependencyMatrix.size = fileSizes;
        dependencyMatrix.data = dependencyData;
        return dependencyMatrix;
    }

    /**
     * Gets all of the mentions of other classes in a class's contents.
     *
     * @param fileContents  a string representing the file's contents
     * @param currFile      the name of the current file being read
     * @param fileNames     a list of all file names inside the directory, excluding the file which is being parsed here
     * @returns {number, Map<string, Array<DependencyTypes>>}    number of lines in file and map of dependencies to file names.
     *
     */
    public getDependenciesFromClass(fileContents: string, currFile: string, fileNames: string[]) {
        let fileLines = fileContents.split("\n");
        let importRegex = RegExp("^(\\t|    )?import");
        let singleLineCommentRegex = RegExp("^(\\t|    )?(\\/\\/)");
        let multiLineCommentRegex = RegExp("^(\\t|    )?(\\/\\*|\\*)");

        let dependencies = new Map();
        let fileInfo = {
            size: 0,
            dependencies: undefined
        };

        // create empty dependency obj for each file name
        fileNames.forEach((name: string) => {
            dependencies.set(name, []);
        });

        fileLines.forEach((line: string) => {
            // skip any import statements
            if(importRegex.test(line)) {
                return;
            }

            // skip comments
            if(singleLineCommentRegex.test(line) || multiLineCommentRegex.test(line)) {
                return;
            }

            // check whether dependency exists.
            fileNames.forEach((name: string) => {
                let currDepSet = dependencies.get(name);


                // is current line class declaration?
                let classDeclRegex = RegExp("^(public class "+ currFile + ")");
                if(classDeclRegex.test(line)) {
                    let inheritanceContext = {};
                    let splitLine = line.split("extends");
                    inheritanceContext["inheritance"] = splitLine.length > 1 ? splitLine[1] : null;
                    splitLine = line.split("implements");
                    inheritanceContext["implementation"] = splitLine.length > 1 ? splitLine[1] : null;

                    // check for inheritance
                    let inheritanceRegex = RegExp( "( " + name + "( |{))");
                    if(inheritanceContext["inheritance"] && inheritanceRegex.test(inheritanceContext["inheritance"])) {
                        if(!currDepSet.includes(DependencyTypes.Inheritance)) {
                            currDepSet.push(DependencyTypes.Inheritance);
                        }
                    }

                    // check for implementation
                    let implementationRegex = RegExp("( " + name + "( |,|{))");
                    if(inheritanceContext["implementation"] && implementationRegex.test(inheritanceContext["implementation"])) {
                        if(!currDepSet.includes(DependencyTypes.Implementation)) {
                            currDepSet.push(DependencyTypes.Implementation);
                        }
                    }

                    return;
                }

                // handle HASA relationship (association)
                let hasARegex = RegExp("(\\t|    )?(public |private |protected )(final |static ){0,2}([\\w\\d<>, ]* )([\\w\\d_.-]+)( )?(;$|=)");
                // let hasANameRegex = RegExp("^(\\t|    )?(public |private |protected )(final |static ){0,2}("+name+"|[\\w\\d]*<"+name+">)");
                let hasANameRegex = RegExp("^(\\t|    )?(public |private |protected )(final |static ){0,2}("+name+
                    "|[\\w\\d]*<"+name+"|[\\w\\d<>, ]*"+name+")");
                if(hasARegex.test(line)) {
                    if(hasANameRegex.test(line) && !currDepSet.includes(DependencyTypes.Association)) {
                        currDepSet.push(DependencyTypes.Association);
                    }
                    return;
                }

                // check for all other dependencies
                let spaceRegex = RegExp("( " + name + "|" + name + " )");
                let brackRegex = RegExp("(\\(" + name + " )");
                let collRegex = RegExp("<" + name + "|" + name + ">");
                if(spaceRegex.test(line) || brackRegex.test(line) || collRegex.test(line)) {
                    if(!currDepSet.includes(DependencyTypes.Dependency)) {
                        currDepSet.push(DependencyTypes.Dependency);
                    }
                }
            });
        });
        fileInfo.dependencies = dependencies;
        fileInfo.size = fileLines.length - 1;
        return fileInfo;
    }
}