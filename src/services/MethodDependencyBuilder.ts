import MethodParser from "./MethodParser";
import GithubService from "./GithubService";
import {Method} from "../interfaces/Method";
import GitCommitCache from "./GitCommitCache";
import RestClient from "../rest/RestClient";

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
        // 1) Get the methods at commit HEAD
        let methodsAtHead = await this.getAllMethodsAtHeadOfRepo(repoUrl, repoName);

        // 2) For every commit C earlier than HEAD
        let allCommits = await this.ghService.getAndSaveAllCommits(repoUrl);
        console.log(allCommits);
    }

    public async getAllMethodsAtHeadOfRepo(repoUrl: string, repoName: string) {
        let methods: Method[];

        await this.ghService.getAndSaveRepo(repoUrl);
        methods = await this.methodParser.getMethodsFromProject("./data/", repoName);

        return methods;
    }
}
