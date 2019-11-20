import { expect } from "chai";
import GithubService from "../../src/services/GithubService";
import GitCommitCache from "../../src/services/GitCommitCache";
import RestClient from "../../src/rest/RestClient";
import {Method} from "../../src/interfaces/Method";
import FileDependencyGraphBuilder from "../../src/services/FileDependencyGraphBuilder";

describe("FileDependencyGraphBuilder tests", () => {

    let fileDepGraph: FileDependencyGraphBuilder = new FileDependencyGraphBuilder();
    let liveRestClient: RestClient = new RestClient();
    let liveCache: GitCommitCache = new GitCommitCache();
    let ghService: GithubService;

    // it("should obtain the java-practice repo file and get all the methods from that repo file", async () => {
    //     const sampleRepo: string = "https://github.com/jyoo980/java-practice";
    //     ghService = new GithubService(liveRestClient, liveCache);
    //     let response: string;
    //     try {
    //         response = await ghService.getAndSaveRepo(sampleRepo);
    //     } catch (err) {
    //         response = err;
    //         expect.fail(err);
    //     } finally {
    //         expect(response).to.equal("./data/java-practice-PARSED.txt");
    //         let methods: Method[];
    //         try {
    //             methods = await methodParser.getMethodsFromProject("./data/", "java-practice");
    //         } catch (err) {
    //             throw err;
    //         } finally {
    //             expect(methods[0].name).to.equal('getOwner');
    //             expect(methods[0].startLine).to.equal(19);
    //             expect(methods[0].endLine).to.equal(21);
    //             expect(methods[0].returnType).to.equal('String');
    //         }
    //     }
    // });

    it("should get java-practice repo file and get all dependencies", async () => {
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
                let methods: Method[];
                try {
                    methods = await fileDepGraph.getDependenciesFromProject("./data/", "java-practice");
                } catch (err) {
                    throw err;
                } finally {
                }
            }
    });
});
