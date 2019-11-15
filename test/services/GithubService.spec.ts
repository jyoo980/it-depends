import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import RestClient from "../../src/rest/RestClient";
import GitCommitCache from "../../src/services/GitCommitCache";

describe("GithubService tests", () => {

    let liveRestClient: RestClient = new RestClient();
    let liveCache: GitCommitCache = new GitCommitCache();
    let ghService: GithubService;

    it("should return a list of commits up to the latest commit", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/TypeScript.ts";
        ghService = new GithubService(liveRestClient, liveCache);
        try {
            let commitList = await ghService.getAndSaveAllCommits(sampleRepo);
        } catch (err) {
            expect.fail(err);
        }
    });
});
