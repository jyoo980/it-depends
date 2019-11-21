import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import GitCommitCache from "../../src/services/GitCommitCache";
import RestClient from "../../src/rest/RestClient";
import FileDependencyGraphBuilder from "../../src/services/FileDependencyGraphBuilder";
import {DependencyTypes} from "../../src/model/DependencyMatrix";

describe("FileDependencyGraphBuilder tests", () => {

    let fileDepGraph: FileDependencyGraphBuilder = new FileDependencyGraphBuilder();
    let liveRestClient: RestClient = new RestClient();
    let liveCache: GitCommitCache = new GitCommitCache();
    let ghService: GithubService;

    it("pulls contents of java-practice repo and retrieves all file-level dependencies", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/java-practice";
            ghService = new GithubService(liveRestClient, liveCache);
            let response: string;
            try {
                response = await ghService.getAndSaveRepo(sampleRepo);
            } catch (err) {
                response = err;
                expect.fail(err);
            } finally {
                expect(response).to.equal("./data/java-practice-PARSED.txt");
                let fileDep;
                try {
                    fileDep = await fileDepGraph.getDependenciesFromProject("./data/", "java-practice");
                } catch (err) {
                    throw err;
                } finally {
                    expect(fileDep.names.length).to.equal(62);
                    expect(fileDep.names[0]).to.equal("Account");
                    expect(fileDep.data.length).to.equal(62);
                    expect(fileDep.data[0][0]).to.be.empty;
                    expect(fileDep.data[0][1].length).to.equal(1);
                    expect(fileDep.data[0][1]).to.contain(DependencyTypes.References);
                }
            }
    });

    it("pulls contents of DNS resolver repo and retrieves all file-level dependencies", async () => {
        const sampleRepo: string = "https://github.com/scveloso/DNS-Resolver";
        ghService = new GithubService(liveRestClient, liveCache);
        let response: string;
        try {
            response = await ghService.getAndSaveRepo(sampleRepo);
        } catch (err) {
            response = err;
            expect.fail(err);
        } finally {
            expect(response).to.equal("./data/DNS-Resolver-PARSED.txt");
            let fileDep;
            try {
                fileDep = await fileDepGraph.getDependenciesFromProject("./data/", "DNS-Resolver");
            } catch (err) {
                throw err;
            } finally {
                expect(fileDep.names.length).to.equal(5);
                ["DNSCache", "DNSLookupService", "DNSNode", "RecordType", "ResourceRecord"].forEach((file) => {
                    expect(fileDep.names).to.contain(file);
                });
                expect(fileDep.data.length).to.equal(5);
                console.log(fileDep.data);
                expect(fileDep.data[0][0]).to.be.empty;
                expect(fileDep.data[0][1]).to.be.empty;
                expect(fileDep.data[0][2]).to.contain(DependencyTypes.References);
                expect(fileDep.data[0][3]).to.be.empty;
                expect(fileDep.data[0][4]).to.contain(DependencyTypes.References);
                expect(fileDep.data[1][0]).to.contain(DependencyTypes.References);
                expect(fileDep.data[1][1]).to.be.empty;
                expect(fileDep.data[1][2]).to.contain(DependencyTypes.References);
                expect(fileDep.data[1][3]).to.contain(DependencyTypes.References);
                expect(fileDep.data[1][4]).to.contain(DependencyTypes.References);
            }
        }
    });
});
