import FileSystem from "../util/FileSystem";
import {CommitInfo} from "../interfaces/GitHubTypes";

export interface ICommitCache {
    exists(repoUrl: string): Promise<boolean>;
    getCommitData(repoUrl: string);
    persistCommits(repoUrl: string, commitInfo: Array<CommitInfo>): Promise<void>;
    readCommitsUpTo(repoUrl: string, upTo: number);
    readCommitsBetween(repoUrl: string, startIndex: number, endIndex: number);
    writeRepoToDisk(dir: string, repoName: string, content: any): Promise<string>
}

export default class GitCommitCache implements ICommitCache {

    private readonly fileSystem: FileSystem;
    private readonly commitCache: Map<string, Array<CommitInfo>>;

    constructor() {
        this.fileSystem = new FileSystem();
        this.commitCache = new Map();
    }

    public async exists(repoUrl: string): Promise<boolean> {
        const key: string = this.stripRepoName(repoUrl);
        if (this.commitCache.has(key)) {
            return true;
        }
        try {
            return await this.fileSystem.isOnDisk("./data", `${key}.txt`);
        } catch (err) {
            // The function above should never throw an error.
            console.error(`GitCommitCache::checking for existence of: ${key} failed`);
        }
    }

    public async persistCommits(repoUrl: string, commitInfo: Array<CommitInfo>): Promise<void> {
        const key = this.stripRepoName(repoUrl);
        this.commitCache.set(key, commitInfo);
        const commitsToWrite = JSON.stringify(commitInfo);
        await this.fileSystem.write("./data", `${key}.txt`, commitsToWrite);
    }

    public async readCommitsUpTo(repoUrl: string, upTo: number) {
        const commitData: Array<CommitInfo> = await this.getCommitData(repoUrl);
        return this.filterCommitsBefore(commitData, upTo);
    }

    public async readCommitsBetween(repoUrl: string, startIndex: number, endIndex: number) {
        const commitData: Array<CommitInfo> = await this.getCommitData(repoUrl);
        return this.filterCommitsBetween(commitData, startIndex, endIndex);
    }

    public async getCommitData(repoUrl: string): Promise<Array<CommitInfo>> {
        const key = this.stripRepoName(repoUrl);
        if (this.commitCache.has(key)) {
            return this.commitCache.get(key);
        }
        const rawData = await this.fileSystem.read("./data", `${key}.txt`);
        return JSON.parse(rawData) as Array<CommitInfo>;
    }

    public filterCommitsBefore(commits: Array<CommitInfo>, upTo: number): Array<CommitInfo> {
        return commits.slice(0, upTo);
    }

    public filterCommitsBetween(commits: Array<CommitInfo>, startIndex: number, endIndex: number): Array<CommitInfo> {
        return commits.slice(startIndex, endIndex);
    }

    public async writeRepoToDisk(dir: string, repoName: string, content: any): Promise<string> {
        return await this.fileSystem.writeRepoToDisk(dir, repoName, content);
    }

    private stripRepoName(repoUrl: string): string {
        const lastSlashIndex: number = repoUrl.lastIndexOf("/");
        return repoUrl.substring(lastSlashIndex + 1);
    }
}
