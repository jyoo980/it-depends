import IRestClient, {IRestResponse} from "../rest/RestClient";
import URLBuilder from "./URLBuilder";
import {CommitInfo} from "../interfaces/GitHubTypes";
import ResponseParser from "./ResponseParser";
import {ICommitCache} from "./GitCommitCache";
import AccessTokenManager from "../util/AccessTokenManager";

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
        this.urlBuilder = new URLBuilder( AccessTokenManager.getGithubAccessToken());
        this.responseParser = new ResponseParser();
        this.cache = cache;
    }

    public async getAndSaveAllCommits(repoUrl: string): Promise<Array<CommitInfo>> {
        try {
            const historyExists: boolean = await this.cache.exists(repoUrl);
            if (!historyExists) {
                let totalNumCommits = await this.getNumCommits(repoUrl);
                let retrievedCommits: Array<CommitInfo> = new Array<CommitInfo>();
                while (retrievedCommits.length < totalNumCommits) {
                    const commits = await this.getMoreCommits(retrievedCommits, repoUrl);
                    retrievedCommits = retrievedCommits.concat(commits);
                }
                await this.cache.persistCommits(repoUrl, retrievedCommits);
                return retrievedCommits;
            }
            return await this.cache.getCommitData(repoUrl);
        } catch (err) {
            console.warn(`GithubService::Error while getting commits from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError
        }
    }

    private async getMoreCommits(retrievedCommits: Array<CommitInfo>, repoUrl: string): Promise<Array<CommitInfo>> {
        const offsetDateByMinute = (latestCommitTime) => {
            return new Date(new Date(latestCommitTime).getTime() - 60000).toISOString();
        };

        let dateUpTo: string;
        if (retrievedCommits.length === 0) {
            dateUpTo = new Date().toISOString();
        } else {
            const latestCommitTime = retrievedCommits[retrievedCommits.length - 1].date;
            dateUpTo = offsetDateByMinute(latestCommitTime);
        }
        const requestUrl = this.urlBuilder.buildListCommitsUrl(repoUrl, dateUpTo);
        const rawCommits = await this.restClient.get(requestUrl);
        const commitSHAs = this.responseParser.getCommitSHAs(rawCommits.body);
        return await this.hydrateCommits(repoUrl, commitSHAs);
    }

    public async listCommitsUpTo(repoUrl: string, dateString: string): Promise<Array<CommitInfo>> {
        try {
            const historyExists: boolean = await this.cache.exists(repoUrl);
            if (!historyExists) {
                await this.getAndSaveAllCommits(repoUrl);
            }
            return await this.cache.readCommitsUpTo(repoUrl, dateString);
        } catch (err) {
            console.warn(`GithubService::Error while listing commits from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
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
            console.warn(`GithubService::Error while listing commits from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
        }
    }

    public async getFileAtCommit(repoUrl: string, filePath: string, commitSHA: string): Promise<string> {
        try {
            const url: string = this.urlBuilder.buildGetFileUrl(repoUrl, filePath, commitSHA);
            const response: IRestResponse = await this.restClient.get(url);
            return this.responseParser.extractFileContents(response.body);
        } catch (err) {
            console.warn(`GithubService::Error while getting file contents from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
        }
    }

    /**
     *
     * @param repoUrl the url of the repo we want to obtain
     * @param commitSha optional. The commit at which we want to grab the state of the repo
     *
     * Returns the path to the repo as a zip file we've saved onto disk
     */
    public async getAndSaveRepo(repoUrl: string, commitSha?: string): Promise<string> {
        try {
            const url: string = this.urlBuilder.buildGetRepoUrl(repoUrl, commitSha);
            const response: IRestResponse = await this.restClient.getAsBuffer(url);
            let repoName: string = this.urlBuilder.getRepoName(repoUrl);
            if (commitSha !== undefined) {
                repoName = `${repoName}--${commitSha}`;
            }
            return await this.cache.writeRepoToDisk("./data", repoName, response.body);
        } catch (err) {
            console.warn(`GithubService::Error while downloading repo: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
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
            console.warn(`GithubService::Error while hydrating commits from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
        }
    }

    private async getNumCommits(repoUrl: string): Promise<number> {
        const requestUrl = this.urlBuilder.buildListContributorsUrl(repoUrl);
        try {
            const response = await this.restClient.get(requestUrl);
            return this.responseParser.extractNumCommits(response.body);
        } catch (err) {
            console.warn(`GithubService::Error retrieving number of commits from: ${repoUrl}`);
            throw { message: err.message } as GithubServiceError;
        }
    }
}
