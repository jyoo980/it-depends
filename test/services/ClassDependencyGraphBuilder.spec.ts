import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import GitCommitCache from "../../src/services/GitCommitCache";
import RestClient from "../../src/rest/RestClient";
import FileDependencyGraphBuilder from "../../src/services/FileDependencyGraphBuilder";
import {DependencyTypes} from "../../src/model/DependencyMatrix";
import ClassDependencyGraphBuilder from "../../src/services/ClassDependencyGraphBuilder";

describe("ClassDependencyGraphBuilder tests", () => {

    let classDep: ClassDependencyGraphBuilder = new ClassDependencyGraphBuilder();
    let liveRestClient: RestClient = new RestClient();
    let liveCache: GitCommitCache = new GitCommitCache();
    let ghService: GithubService;

    it("pulls contents of java-practice repo and retrieves all class-level dependencies", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/java-practice";
        ghService = new GithubService(liveRestClient, liveCache);
        let response: string;
        let commit = "3fc4f208530f86a7cfef70f1010a52670e5f972a";
        try {
            response = await ghService.getAndSaveRepo(sampleRepo, commit);
        } catch (err) {
            response = err;
            expect.fail(err);
        } finally {
            expect(response).to.equal("./data/java-practice--" + commit + "-PARSED.txt");
            let fileDep;
            try {
                fileDep = await classDep.getDependenciesFromProject("./data/", "java-practice", commit);
            } catch (err) {
                throw err;
            } finally {
                expect(fileDep.names.length).to.equal(62);
                expect(fileDep.names[0]).to.equal("Account");
                expect(fileDep.data.length).to.equal(62);
                expect(fileDep.data[0][0]).to.be.empty;
                expect(fileDep.data[0][1].length).to.equal(2);
                expect(fileDep.data[0][1]).to.contain(DependencyTypes.Association);
                expect(fileDep.data[0][1]).to.contain(DependencyTypes.Dependency);
                // Convertible extends Car
                expect(fileDep.data[27][11]).to.contain(DependencyTypes.Inheritance);
                // Landline implements Communicator
                expect(fileDep.data[22][20]).to.contain(DependencyTypes.Implementation);
            }
        }
    });

    it("pulls contents of DNS resolver repo and retrieves all file-level dependencies", async () => {
        const sampleRepo: string = "https://github.com/scveloso/DNS-Resolver";
        ghService = new GithubService(liveRestClient, liveCache);
        let response: string;
        let commit = "3e6288124cce43a861603c331c9419531595f707";
        try {
            response = await ghService.getAndSaveRepo(sampleRepo, commit);
        } catch (err) {
            response = err;
            expect.fail(err);
        } finally {
            expect(response).to.equal("./data/DNS-Resolver--"+ commit+ "-PARSED.txt");
            let fileDep;
            try {
                fileDep = await classDep.getDependenciesFromProject("./data/", "DNS-Resolver", commit);
            } catch (err) {
                throw err;
            } finally {
                expect(fileDep.names.length).to.equal(5);
                ["DNSCache", "DNSLookupService", "DNSNode", "RecordType", "ResourceRecord"].forEach((file) => {
                    expect(fileDep.names).to.contain(file);
                });

                expect(fileDep.size.length).to.equal(5);
                expect(fileDep.size[0]).to.equal(92);
                expect(fileDep.size[1]).to.equal(459);
                expect(fileDep.size[2]).to.equal(57);
                expect(fileDep.size[3]).to.equal(31);
                expect(fileDep.size[4]).to.equal(102);

                expect(fileDep.data.length).to.equal(5);
                expect(fileDep.data[0][0]).to.be.empty;
                expect(fileDep.data[0][1]).to.be.empty;
                expect(fileDep.data[0][2]).to.contain(DependencyTypes.Association);
                expect(fileDep.data[0][2]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[0][3]).to.be.empty;
                expect(fileDep.data[0][4]).to.contain(DependencyTypes.Association);
                expect(fileDep.data[0][4]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[1][0]).to.contain(DependencyTypes.Association);
                expect(fileDep.data[1][1]).to.be.empty;
                expect(fileDep.data[1][2]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[1][3]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[1][4]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[2][0]).to.be.empty;
                expect(fileDep.data[2][1]).to.be.empty;
                expect(fileDep.data[2][2]).to.be.empty;
                expect(fileDep.data[2][3]).to.contain(DependencyTypes.Association);
                expect(fileDep.data[2][3]).to.contain(DependencyTypes.Dependency);
                expect(fileDep.data[2][4]).to.be.empty;
            }
        }
    });
});
