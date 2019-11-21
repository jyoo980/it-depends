import { expect } from "chai";
import CrossCutAnalyzer from "../../src/services/CrossCutAnalyzer";
import {CommitInfo, FileInfo} from "../../src/interfaces/GitHubTypes";
import {AnalysisInfo, AnalysisScope} from "../../src/interfaces/AnalysisTypes";

describe("CrossCutAnalyzer tests", () => {

    let ccAnalyzer = new CrossCutAnalyzer();

    it("should return an AnalysisInfo with one file", async () => {
        let commits: Array<CommitInfo> = [];
        let fileInfo: FileInfo = {
            name: "FirstFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo]
        });
        let analysisInfo: AnalysisInfo = {
            headings: ["FirstFile"],
            size: 1,
            type: AnalysisScope.File,
            data: [[1]]
        };
        expect(ccAnalyzer.getFileCrossCut(commits)).to.deep.equal(analysisInfo);
    });

    it("should return an AnalysisInfo with two files", async () => {
        let commits: Array<CommitInfo> = [];
        let fileInfo: FileInfo = {
            name: "FirstFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        let fileInfo2: FileInfo = {
            name: "SecondFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo]
        });
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo, fileInfo2]
        });
        let analysisInfo: AnalysisInfo = {
            headings: ["FirstFile", "SecondFile"],
            size: 2,
            type: AnalysisScope.File,
            data: [[1, 0.5],[1,1]] // changes made to second file in half of first file commits
        };
        expect(ccAnalyzer.getFileCrossCut(commits)).to.deep.equal(analysisInfo);
    });

    it("should return an AnalysisInfo with three files", async () => {
        let commits: Array<CommitInfo> = [];
        let fileInfo: FileInfo = {
            name: "FirstFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        let fileInfo2: FileInfo = {
            name: "SecondFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        let fileInfo3: FileInfo = {
            name: "ThirdFile",
            additions: 1,
            deletions: 0,
            diff: {name: "", linesAdded: [], linesDeleted: [], diffHunks: []}
        };
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo]
        });
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo, fileInfo2]
        });
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo, fileInfo3]
        });
        commits.push({
            sha: "", author: "", message: "", date: "", additions: 1, deletions: 1,
            filesChanged: [fileInfo2, fileInfo3]
        });
        let analysisInfo: AnalysisInfo = {
            headings: ["FirstFile", "SecondFile", "ThirdFile"],
            size: 3,
            type: AnalysisScope.File,
            data: [[1, 0.3333, 0.3333],[0.5,1,0.5], [0.5, 0.5, 1]] // changes made to second file in half of first file commits
        };
        expect(ccAnalyzer.getFileCrossCut(commits)).to.deep.equal(analysisInfo);
    });

});
