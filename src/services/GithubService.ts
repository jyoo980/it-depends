import IRestClient, {IRestResponse} from "../rest/RestClient";
import URLBuilder from "./URLBuilder";
import {CommitInfo} from "../interfaces/GitHubTypes";
import ResponseParser from "./ResponseParser";
import FileSystem from "../util/FileSystem";

export interface GithubServiceError extends Error {
    message: string,
}

export default class GithubService {

    private readonly restClient: IRestClient;
    private readonly urlBuilder: URLBuilder;
    private readonly responseParser: ResponseParser;
    private readonly fileSystem: FileSystem;

    constructor(restClient: IRestClient) {
        this.restClient = restClient;
        this.urlBuilder = new URLBuilder( "9429855a73709cee968ae79fcfe98210a501543b");
        this.responseParser = new ResponseParser();
        this.fileSystem = new FileSystem();
    }

    public async getAndSaveAllCommits(repoUrl: string): Promise<void> {
        const now: string = new Date().toISOString();
        try {
            const allCommitsToNow = await this.listCommitsUpTo(repoUrl, now);
            const commitsASObj = this.mapToObj(allCommitsToNow);
            const commitsToWrite = JSON.stringify(commitsASObj);
            const owner = this.urlBuilder.getOwner(repoUrl);
            const repo = this.urlBuilder.getRepoName(repoUrl);
            await this.fileSystem.write("./data", `${owner}-${repo}-.txt`, commitsToWrite);
        } catch (err) {
            console.warn(err);
            throw { message: err.message } as GithubServiceError
        }
    }

    public async listCommitsUpTo(repoUrl: string, dateString: string): Promise<Map<string, CommitInfo>> {
        try {
            const requestUrl = this.urlBuilder.buildListCommitsUrl(repoUrl, dateString);
            let rawCommits = await this.restClient.get(requestUrl);
            let commitSHAs = this.responseParser.getCommitSHAs(rawCommits.body);
            return await this.hydrateCommits(repoUrl, commitSHAs);
        } catch (err) {
            console.warn(err);
        }
    }

    private async hydrateCommits(repoUrl: string, commitSHAs: Array<string>): Promise<Map<string, CommitInfo>> {
        const detailedCommitRequests = commitSHAs.map((sha) => {
            const url = this.urlBuilder.buildGetSingleCommitUrl(repoUrl, sha);
            return this.restClient.get(url);
        });
        try {
            let rawResponses: IRestResponse[] = await Promise.all(detailedCommitRequests);
            let rawCommitData: any[] = rawResponses.map((response) => response.body);
            return this.responseParser.buildCommitMap(rawCommitData);
        } catch (err) {
            throw err;
        }
    }

    // FROM: https://gist.github.com/lukehorvat/133e2293ba6ae96a35ba
    private mapToObj(commitMap: Map<string, CommitInfo>): {[key: string]: CommitInfo } {
        return Array.from(commitMap.entries()).reduce((main, [key, value]) => ({...main, [key]: value}), {})
    }
}
