import {CommitInfo, FileInfo} from "../interfaces/GitHubTypes";

export default class ResponseParser {

    public buildCommitMap(rawCommitData: Array<any>): Map<string, CommitInfo> {
        return rawCommitData.reduce((commitMap: Map<string, CommitInfo>, rawCommit) => {
            const hydratedInfo = this.extractCommitInfo(rawCommit);
            return commitMap.set(hydratedInfo.sha, hydratedInfo);
        }, new Map());
    }

    public getCommitSHAs(rawCommitData: Array<any>): Array<string> {
        return rawCommitData.map((data) => data["sha"]);
    }

    public extractCommitInfo(rawCommit: any): CommitInfo {
        return {
            sha: rawCommit["sha"],
            author: rawCommit["author"],
            message: rawCommit["commit"]["message"],
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
            } as FileInfo
        });
    }
}
