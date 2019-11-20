import MethodParser from "./MethodParser";
import GithubService from "./GithubService";
import {Method} from "../interfaces/Method";
import GitCommitCache from "./GitCommitCache";
import RestClient from "../rest/RestClient";
import {CommitInfo, FileInfo} from "../interfaces/GitHubTypes";

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

    public async execute(repoUrl: string) {
        let splitUrl = repoUrl.split("/");
        let repoName: string = splitUrl[splitUrl.length - 1];

        // All methods for each commit
        let commitMethodMap = {};
        let allCommits: CommitInfo[] = await this.ghService.getAndSaveAllCommits(repoUrl);
        let HEAD = allCommits[0].sha;

        // Get all methods for HEAD
        commitMethodMap[HEAD] = await this.getAllMethodsAtCommitShaOfRepo(repoUrl, repoName, HEAD);
        commitMethodMap[HEAD] = this.buildMethodMap(commitMethodMap[HEAD]);
        allCommits.shift(); // remove HEAD

        // Get rest of the commits' methods and whether they were changed in this method
        for (let commit of allCommits) {
            let commitMethods = await this.getAllMethodsAtCommitShaOfRepo(repoUrl, repoName, commit.sha);

            for (let method of commitMethods) {
                if (this.isMethodChangedInCommit(method, commit)) {
                    if (commitMethodMap[HEAD][method.getIdentifier()] !== undefined) {
                        commitMethodMap[HEAD][method.getIdentifier()].addCommitChangedIn(commit.sha);
                        console.log("method name: " + method.getIdentifier() + " changed in  " + commit.sha);
                    }
                }
            }

            commitMethodMap[commit.sha] = commitMethods;
        }
    }

    private buildMethodMap(methods: Method[]) {
        let methodMap = {};
        for (let method of methods) {
            methodMap[method.getIdentifier()] = method;
        }

        return methodMap;
    }

    public isMethodChangedInCommit(method: Method, commit: CommitInfo): boolean {
        for (let fileChanged of commit.filesChanged) {
            if (this.methodInFileAndHasDiffs(fileChanged, method)) {
                let methodChanged = false;
                fileChanged.diff.diffHunks.forEach((diffHunk) => {
                    if ((diffHunk.start >= method.startLine &&
                        diffHunk.start <= method.endLine) ||
                        (diffHunk.end >= method.startLine &&
                            diffHunk.end <= method.endLine)) {
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

    private methodInFileAndHasDiffs(fileChanged: FileInfo, method: Method): boolean {
        return fileChanged.name === method.file && fileChanged.diff !== undefined &&
            fileChanged.diff.diffHunks !== undefined;
    }

    public async getAllMethodsAtCommitShaOfRepo(repoUrl: string, repoName: string, commitSha?: string) {
        let methods: Method[];

        await this.ghService.getAndSaveRepo(repoUrl, commitSha);
        methods = await this.methodParser.getMethodsFromProject("./data/", repoName, commitSha);

        return methods;
    }
}
