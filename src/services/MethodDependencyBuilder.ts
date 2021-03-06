import MethodParser from "./MethodParser";
import GithubService from "./GithubService";
import {Method} from "../interfaces/Method";
import GitCommitCache from "./GitCommitCache";
import RestClient from "../rest/RestClient";
import {CommitInfo, FileInfo} from "../interfaces/GitHubTypes";

/**
 * A class to extract and analyze methods across a range of commits for a given repository.
 *
 * TODO: Building the dependency graph from the methods map generated by execute(...) below
 */
export default class MethodDependencyBuilder {
    methodParser: MethodParser;
    ghService: GithubService;
    liveRestClient: RestClient;
    liveCache: GitCommitCache;

    constructor(ghService: GithubService) {
        this.methodParser = new MethodParser();
        this.ghService = ghService;
    }

    /**
     * Return a dictionary of method identifiers to the actual methods.
     * Each method object has properties, method dependencies and which commits they've been changed in.
     *
     * @param repoUrl the repository to extract and analyze methods from
     */
    public async execute(repoUrl: string) {
        let splitUrl = repoUrl.split("/");
        let repoName: string = splitUrl[splitUrl.length - 1];

        let allCommits: CommitInfo[] = await this.ghService.getAndSaveAllCommits(repoUrl);
        let HEAD = allCommits[0].sha;

        // Get all methods for HEAD
        // TODO: Make this first commit customizable
        let headMethods = await this.getAllMethodsAtCommitShaOfRepo(repoUrl, repoName, HEAD);
        let headMethodsMap = this.buildMethodMap(headMethods);

        // Get rest of the commits' methods and whether they were changed in this method
        for (let commit of allCommits) {
            let commitMethods = await this.getAllMethodsAtCommitShaOfRepo(repoUrl, repoName, commit.sha);

            for (let method of commitMethods) {
                if (this.isMethodChangedInCommit(method, commit)) {
                    if (headMethodsMap[method.getIdentifier()] !== undefined) {
                        headMethodsMap[method.getIdentifier()].addCommitChangedIn(commit.sha);
                    }
                }
            }
        }

        this.populateMethodInterdependencies(headMethodsMap);

        return headMethodsMap;
    }

    /**
     * Populate method dependencies within the given method map (which methods depend on other methods)
     *
     * @param methodMap a dictionary from method identifier to method
     */
    private populateMethodInterdependencies(methodMap): void {
        for (let methodIdentifier in methodMap) {
            for (let otherMethodIdentifier in methodMap) {
                if (methodIdentifier !== otherMethodIdentifier) {
                    // Check contents of method for other method
                    for (let contentLine of methodMap[methodIdentifier].content.split("\n")) {
                        let otherMethodName = methodMap[otherMethodIdentifier].name;
                        if (contentLine.indexOf(otherMethodName) !== -1) {
                            methodMap[methodIdentifier].addMethodDependency(otherMethodIdentifier);
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * Builds a method dictionary from a given array of Methods
     *
     * Allows us to update methods based on which commits they have been
     * changed in O(1) time.
     *
     * @param methods the methods to build a dictionary out of
     */
    private buildMethodMap(methods: Method[]) {
        let methodMap = {};
        for (let method of methods) {
            methodMap[method.getIdentifier()] = method;
        }

        return methodMap;
    }

    /**
     * Returns true if the given Method was changed in the given commit
     *
     * @param method the given Method
     * @param commit the commit to check if the method has been changed in
     */
    private isMethodChangedInCommit(method: Method, commit: CommitInfo): boolean {
        for (let fileChanged of commit.filesChanged) {
            if (this.methodInFileAndHasDiffs(fileChanged, method)) {
                let methodChanged = false;
                fileChanged.diff.diffHunks.forEach((diffHunk) => {
                    if ((diffHunk.start >= method.startLine &&  // 1) Hunk start is contained within method
                        diffHunk.start <= method.endLine) ||
                        (diffHunk.end >= method.startLine &&    // 2) Hunk end is contained within method
                            diffHunk.end <= method.endLine) ||
                        (diffHunk.start <= method.startLine &&  // 3) Method is contained within hunk
                            diffHunk.end >= method.endLine)) {
                        methodChanged = true;
                        return;
                    }
                });

                if (methodChanged) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Returns true if the given Method is contained in the file, and
     * if the file has valid diff and diff hunks
     *
     * @param fileChanged the file to check
     * @param method to check in the file
     */
    private methodInFileAndHasDiffs(fileChanged: FileInfo, method: Method): boolean {
        return fileChanged.name === method.file && fileChanged.diff !== undefined &&
            fileChanged.diff.diffHunks !== undefined;
    }

    /**
     * Returns all the methods at a given repo and commit sha using MethodParser
     * and GithubService
     *
     * @param repoUrl the URL of the repository to check
     * @param repoName name of the repository
     * @param commitSha the commit to get the methods at
     */
    private async getAllMethodsAtCommitShaOfRepo(repoUrl: string, repoName: string, commitSha?: string) {
        let methods: Method[];

        try {
            await this.ghService.getAndSaveRepo(repoUrl, commitSha);
            methods = await this.methodParser.getMethodsFromProject("./data/", repoName, commitSha);
        } catch (err) {
            console.log(`MethodDependencyBuilder::failed to get methods from repo: ${repoName}`);
            throw err;
        }

        return methods;
    }
}