import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import RestClient from "../../src/rest/RestClient";
import GitCommitCache from "../../src/services/GitCommitCache";
import {CommitInfo} from "../../src/interfaces/GitHubTypes";

describe("GithubService tests", () => {

    let liveRestClient: RestClient = new RestClient();
    let liveCache: GitCommitCache = new GitCommitCache();
    let ghService: GithubService;

    it("should return a list of commits up to the latest commit", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/TypeScript.ts";
        let totalNumCommits: Array<CommitInfo>;
        ghService = new GithubService(liveRestClient, liveCache);
        try {
            totalNumCommits = await ghService.getAndSaveAllCommits(sampleRepo);
        } catch (err) {
            totalNumCommits = err;
        } finally {
            expect(totalNumCommits.length).to.equal(159);
        }
    });

    it("should read a file given a repo, filepath, and commitSHA", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/it-depends";
        const sha: string = "79e8a654e8b6a99fdc15c36ea5064edbfb440e9c";
        const path: string = "src/rest/RestClient.ts";
        let file: string;
        ghService = new GithubService(liveRestClient, liveCache);
        try {
            file = await ghService.getFileAtCommit(sampleRepo, path, sha);
            console.log(file);
        } catch (err) {
            file = err;
        } finally {
            // TODO
        }
    });

    it("should obtain a repo as a .zip file", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/it-depends";
        ghService = new GithubService(liveRestClient, liveCache);
        let response: string;
        try {
            response = await ghService.getAndSaveRepo(sampleRepo);
        } catch (err) {
            response = err;
        } finally {
            expect(response).to.equal("./data/it-depends.zip");
        }
    });
});
