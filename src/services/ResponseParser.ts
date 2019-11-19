import {CommitInfo, FileInfo} from "../interfaces/GitHubTypes";
import PatchParser from "./PatchParser";

export default class ResponseParser {

    private readonly patchParser: PatchParser;

    constructor() {
        this.patchParser = new PatchParser();
    }

    public buildCommitMap(rawCommitData: Array<any>): Array<CommitInfo> {
        return rawCommitData.map((rawCommit) => {
            return this.extractCommitInfo(rawCommit);
        });
    }

    public getCommitSHAs(rawCommitData: Array<any>): Array<string> {
        return rawCommitData.map((data) => data["sha"]);
    }

    public extractCommitInfo(rawCommit: any): CommitInfo {
        return {
            sha: rawCommit["sha"],
            author: rawCommit["author"],
            message: rawCommit["commit"]["message"],
            date: rawCommit["commit"]["committer"]["date"],
            additions: rawCommit["stats"]["additions"],
            deletions: rawCommit["stats"]["deletions"],
            filesChanged: this.extractFileInfo(rawCommit["files"]),
        } as CommitInfo;
    }

    public extractFileInfo(rawFileInfo: any[]): Array<FileInfo> {
        return rawFileInfo.map((fileInfo) => {
            return {
                name: fileInfo["filename"],
                additions: fileInfo["additions"],
                deletions: fileInfo["deletions"],
                diff: this.patchParser.extractPatchInfo(fileInfo["filename"], fileInfo["patch"]),
            } as FileInfo
        });
    }

    public extractNumCommits(contributors: any[]): number {
        return contributors.reduce((numCommits, contributorData) => {
            return numCommits + contributorData["contributions"];
        }, 0);
    }

    public extractFileContents(rawFileInfo: any): string {
        let buffer = new Buffer(rawFileInfo["content"], 'base64');
        return buffer.toString();
    }
}
