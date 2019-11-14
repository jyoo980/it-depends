import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import RestClient from "../../src/rest/RestClient";

describe("GithubService tests", () => {

    let liveRestClient: RestClient = new RestClient();
    let ghService: GithubService;

    it("should return a list of commits up to the latest commit", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/TypeScript.ts";
        const now: string = new Date().toISOString();
        ghService = new GithubService(liveRestClient);
        try {
            let commitList = await ghService.getAndSaveAllCommits(sampleRepo);
        } catch (err) {
            expect.fail(err);
        }
    });
});
