import { expect } from "chai";
import URLBuilder from "../../src/services/URLBuilder";

describe("URLBuilder tests", () => {

    const sampleRepoUrl: string = "https://github.com/jyoo980/TypeScript.ts";
    const fakeAccessToken: string = "hahathisisafakeaccesstoken";
    let builder: URLBuilder;

    before(() => {
        builder = new URLBuilder(fakeAccessToken);
    });

    it("should correctly build a GET request URL for obtaining a single commit's info", () => {
        const sha: string = "f0219559d3f2f2a33a0c404bb9c1b8fcd3dcf480";
        const requestUrl: string = builder.buildGetSingleCommitUrl(sampleRepoUrl, sha);
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/commits/${sha}?access_token=${fakeAccessToken}`);
    });

    it("should correctly build a GET request URL for getting a branch (default to master)", () => {
        const requestUrl: string = builder.buildGetBranchUrl(sampleRepoUrl);
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/branches/master?access_token=${fakeAccessToken}`);
    });

    it("should correctly build a GET request URL for getting a branch (non-default to master)", () => {
        const requestUrl: string = builder.buildGetBranchUrl(sampleRepoUrl,"foobar");
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/branches/foobar?access_token=${fakeAccessToken}`);
    });

    it("should correctly build a GET request URL for listing all commits on a repo", () => {
        const currentTime: string = new Date().toISOString();
        const requestUrl: string = builder.buildListCommitsUrl(sampleRepoUrl, currentTime);
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/commits?until=${currentTime}&per_page=100&access_token=${fakeAccessToken}`);
    });
});
