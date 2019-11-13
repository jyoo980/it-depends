import { expect } from "chai";
import URLBuilder from "../../src/services/URLBuilder";

describe("URLBuilder tests", () => {

    const sampleRepoUrl: string = "https://github.com/jyoo980/TypeScript.ts";
    let builder: URLBuilder;

    before(() => {
        builder = new URLBuilder(sampleRepoUrl);
    });

    it("should be correctly instantiated with a repo name and url", () => {
        expect(builder["repo"]).to.equal("TypeScript.ts");
        expect(builder["owner"]).to.equal("jyoo980");
    });

    it("should correctly build a GET request URL for obtaining a single commit's info", () => {
        const sha: string = "f0219559d3f2f2a33a0c404bb9c1b8fcd3dcf480";
        const requestUrl: string = builder.buildGetSingleCommitUrl(sha);
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/commits/${sha}`);
    });

    it("should correctly build a GET request URL for getting a branch (default to master)", () => {
        const requestUrl: string = builder.buildGetBranchUrl();
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/branches/master`);
    });

    it("should correctly build a GET request URL for getting a branch (non-default to master)", () => {
        const requestUrl: string = builder.buildGetBranchUrl("foobar");
        expect(requestUrl).to.equal(`https://api.github.com/repos/jyoo980/TypeScript.ts/branches/foobar`);
    })
});
