import IRestClient, {IRestResponse} from "../rest/RestClient";
import URLBuilder from "./URLBuilder";
import {CommitInfo} from "../interfaces/GitHubTypes";
import ResponseParser from "./ResponseParser";
import {ICommitCache} from "./GitCommitCache";

export interface GithubServiceError extends Error {
    message: string,
}

export default class GithubService {

    private readonly restClient: IRestClient;
    private readonly urlBuilder: URLBuilder;
    private readonly responseParser: ResponseParser;
    private readonly cache: ICommitCache;

    constructor(restClient: IRestClient, cache: ICommitCache) {
        this.restClient = restClient;
        this.urlBuilder = new URLBuilder( "3fc9ac24e39a5705954fadf7c30633ae9193c007");
        this.responseParser = new ResponseParser();
        this.cache = cache;
    }

    public async getAndSaveAllCommits(repoUrl: string): Promise<void> {
        try {
            const historyExists: boolean = await this.cache.exists(repoUrl);
            if (!historyExists) {
                const now: string = new Date().toISOString();
                const requestUrl = this.urlBuilder.buildListCommitsUrl(repoUrl, now);
                const rawCommits = await this.restClient.get(requestUrl);
                const commitSHAs = this.responseParser.getCommitSHAs(rawCommits.body);
                const richCommits: Array<CommitInfo> = await this.hydrateCommits(repoUrl, commitSHAs);
                await this.cache.persistCommits(repoUrl, richCommits);
            }
        } catch (err) {
            console.warn(err);
            throw { message: err.message } as GithubServiceError
        }
    }

    public async listCommitsUpTo(repoUrl: string, dateString: string): Promise<Array<CommitInfo>> {
        try {
            const historyExists: boolean = await this.cache.exists(repoUrl);
            if (!historyExists) {
                this.getAndSaveAllCommits(repoUrl);
            }
            return await this.cache.readCommitsUpTo(repoUrl, dateString);
        } catch (err) {
            console.warn(err);
        }
    }

    public async listCommitsBetween(repoUrl: string, startDate: string, endDate: string): Promise<Array<CommitInfo>> {
        try {
            const historyExists: boolean = await this.cache.exists(repoUrl);
            if (!historyExists) {
                await this.getAndSaveAllCommits(repoUrl);
            }
            return await this.cache.readCommitsBetween(repoUrl, startDate, endDate);
        } catch (err) {
            console.warn(err);
        }
    }

    private async hydrateCommits(repoUrl: string, commitSHAs: Array<string>): Promise<Array<CommitInfo>> {
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
}
