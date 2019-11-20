import MethodParser from "./MethodParser";
import GithubService from "./GithubService";
import {Method} from "../interfaces/Method";
import GitCommitCache from "./GitCommitCache";
import RestClient from "../rest/RestClient";
import {CommitInfo, FileInfo} from "../interfaces/GitHubTypes";

/**
 * A class to build cross-cut dependencies (across previous commits) between methods of HEAD.
 */
export default class MethodDependencyBuilder {
    methodParser: MethodParser;
    ghService: GithubService;
    liveRestClient: RestClient;
    liveCache: GitCommitCache;

    constructor() {
        this.methodParser = new MethodParser();
        this.liveRestClient = new RestClient();
        this.liveCache = new GitCommitCache();
        this.ghService = new GithubService(this.liveRestClient, this.liveCache);
    }

    /**
     * Return cross-cut dependencies between methods of HEAD at the given repoUrl
     *
     * @param repoUrl the repository to build method cross-cut dependencies
     */
    public async execute(repoUrl: string) {
        let splitUrl = repoUrl.split("/");
        let repoName: string = splitUrl[splitUrl.length - 1];

        let allCommits: CommitInfo[] = await this.ghService.getAndSaveAllCommits(repoUrl);
        let HEAD = allCommits[0].sha;

        // Get all methods for HEAD
        let headMethods = await this.getAllMethodsAtCommitShaOfRepo(repoUrl, repoName, HEAD);
        let headMethodsMap = this.buildMethodMap(headMethods);

        //commitMethodMap[HEAD] = this.buildMethodMap(commitMethodMap[HEAD]);
        //allCommits.shift(); // remove HEAD

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

        return headMethodsMap;
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

        await this.ghService.getAndSaveRepo(repoUrl, commitSha);
        methods = await this.methodParser.getMethodsFromProject("./data/", repoName, commitSha);

        return methods;
    }
}
