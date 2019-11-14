import IRestClient, {IRestResponse} from "../rest/RestClient";
import URLBuilder from "./URLBuilder";
import {CommitInfo} from "../interfaces/GitHubTypes";
import ResponseParser from "./ResponseParser";

export default class GithubService {

    private readonly restClient: IRestClient;
    private readonly urlBuilder: URLBuilder;
    private readonly responseParser: ResponseParser;

    constructor(restClient: IRestClient, repoUrl: string) {
        this.restClient = restClient;
        // TODO: utility that loads access token from disk
        this.urlBuilder = new URLBuilder(repoUrl, "REDACTED");
        this.responseParser = new ResponseParser();
    }

    public async listCommitsUpTo(dateString: string): Promise<Map<string, CommitInfo>> {
        try {
            const requestUrl = this.urlBuilder.buildListCommitsUrl(dateString);
            let rawCommits = await this.restClient.get(requestUrl);
            let commitSHAs = this.responseParser.getCommitSHAs(rawCommits.body);
            return await this.hydrateCommits(commitSHAs);
        } catch (err) {
            console.warn(err);
        }
    }

    private async hydrateCommits(commitSHAs: Array<string>): Promise<Map<string, CommitInfo>> {
        const detailedCommitRequests = commitSHAs.map((sha) => {
            const url = this.urlBuilder.buildGetSingleCommitUrl(sha);
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
