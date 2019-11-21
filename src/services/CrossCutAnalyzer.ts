import {CommitInfo} from "../interfaces/GitHubTypes";
import {AnalysisInfo, AnalysisScope} from "../interfaces/AnalysisTypes";

export default class CrossCutAnalyzer {
    constructor() {
    }

    public getFileCrossCut(commits: Array<CommitInfo>): AnalysisInfo {
        let type = AnalysisScope.File;
        let size = 0;
        let headings: Array<string> = [];
        let fileToInd: {[name: string]: number} = {};
        let data: Array<Array<number>> = [];
        let curFileInd: Array<number>;
        for (let commit of commits) {
            curFileInd = [];
            for (let file of commit.filesChanged) {
                // if file not in headings:
                //  - add file name to headings
                //  - add row and col to data (0's)
                if (!headings.includes(file.name)) {
                    size = headings.push(file.name);
                    for (let a of data) {
                        a.push(0);
                    }
                    data.push(new Array(size));
                    data[size - 1].fill(0);
                }
                curFileInd.push(headings.indexOf(file.name));
            }
            // incrm all curCommitFiles by one
            for (let indRow of curFileInd) {
                for (let indCol of curFileInd) {
                    data[indRow][indCol]++;
                }
            }
        }

        // data[i][j] is num commits that we saw both
        // now convert to percentages
        // row is from, col is to
        for (let i = 0; i < size; i++) {
            let sum = data[i][i]; // all commits this file is in
            data[i] = data[i].map(x => parseFloat((x / sum).toPrecision(4)));
        }
        return {headings: headings, size: size, type: type, data: data};
    }
}