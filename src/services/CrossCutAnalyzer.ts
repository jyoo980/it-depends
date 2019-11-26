import {CommitInfo} from "../interfaces/GitHubTypes";
import {AnalysisInfo, AnalysisScope} from "../interfaces/AnalysisTypes";
import MethodDependencyBuilder from "./MethodDependencyBuilder";
import GithubService from "./GithubService";
import {Method} from "../interfaces/Method";

export default class CrossCutAnalyzer {
    private static methodsMap: {url: string, map: { [identifier: string]: Method}};

    constructor() {
    }

    public getFileCrossCut(commits: Array<CommitInfo>): AnalysisInfo {
        let type = AnalysisScope.File;
        let size = 0;
        let names: Array<string> = [];
        let data: Array<Array<number>> = [];
        let curFileInd: Array<number>;
        for (let commit of commits) {
            curFileInd = [];
            for (let file of commit.filesChanged) {
                // if file not in names:
                //  - add file name to names
                //  - add row and col to data (0's)
                if (!names.includes(file.name)) {
                    size = names.push(file.name);
                    for (let a of data) {
                        a.push(0);
                    }
                    data.push(new Array(size));
                    data[size - 1].fill(0);
                }
                curFileInd.push(names.indexOf(file.name));
            }
            // incrm all curCommitFiles by one
            for (let indRow of curFileInd) {
                for (let indCol of curFileInd) {
                    data[indRow][indCol]++;
                }
            }
        }

        data = this.scale(data, size);
        return {names: names, size: size, type: type, data: data};
    }

    public async getMethodCrossCut(url: string, ghService: GithubService, start: number, end: number): Promise<AnalysisInfo> {
        let type = AnalysisScope.Method;
        let size = 0;
        let names: Array<string> = [];
        let data: Array<Array<number>> = [];
        let methDepBuilder;

        // only do methDepBuilder.exec if it hasn't been done yet or there was a url change
        if (CrossCutAnalyzer.methodsMap === undefined || CrossCutAnalyzer.methodsMap.url != url) {
            methDepBuilder = new MethodDependencyBuilder(ghService);
            CrossCutAnalyzer.methodsMap = {
                url: url,
                map: await methDepBuilder.execute(url)
            };
        }

        let allowedCommits: Array<CommitInfo> = await ghService.listCommitsBetween(url, start, end);
        let tmpMethod: Method;
        let methodsChanged: Array<string>;
        let curMethodInd: Array<number>;
        for (let commit of allowedCommits) {
             methodsChanged = [];
            for (let methodId in CrossCutAnalyzer.methodsMap.map) {
                // each method has commits they were changed in
                tmpMethod = CrossCutAnalyzer.methodsMap.map[methodId];
                if (tmpMethod.commitsChangedIn.includes(commit.sha)) {
                    methodsChanged.push(methodId);
                }
            }

            // TODO: make a helper for this since it's almost the same as file
            curMethodInd = [];
            for (let method of methodsChanged) {
                if (!names.includes(method)) {
                    size = names.push(method);
                    for (let a of data) {
                        a.push(0);
                    }
                    data.push(new Array(size));
                    data[size - 1].fill(0);
                }
                curMethodInd.push(names.indexOf(method));
            }
            for (let indRow of curMethodInd) {
                for (let indCol of curMethodInd) {
                    data[indRow][indCol]++;
                }
            }
        }
        data = this.scale(data, size);

        return {names: names, size: size, type: type, data: data};
    }

    private scale(data: Array<Array<number>>, size: number) {
        // data[i][j] is num commits that we saw both
        // now convert to percentages
        // row is from, col is to
        for (let i = 0; i < size; i++) {
            let sum = data[i][i]; // all commits this file/method is in
            data[i] = data[i].map(x => parseFloat((x / sum).toPrecision(4)));
        }

        return data;
    }
}