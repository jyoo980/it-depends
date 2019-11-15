import FileSystem from "../util/FileSystem";
import {CommitInfo} from "../interfaces/GitHubTypes";

export interface ICommitCache {
    exists(repoUrl: string): Promise<boolean>;
    getCommitData(repoUrl: string);
    persistCommits(repoUrl: string, commitInfo: Array<CommitInfo>): Promise<void>;
    readCommitsUpTo(repoUrl: string, date: string);
    readCommitsBetween(repoUrl: string, startDate: string, endDate: string);
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

    public async readCommitsUpTo(repoUrl: string, date: string) {
        const commitData: Array<CommitInfo> = await this.getCommitData(repoUrl);
        return this.filterCommitsBefore(commitData, date);
    }

    public async readCommitsBetween(repoUrl: string, startDate: string, endDate: string) {
        const commitData: Array<CommitInfo> = await this.getCommitData(repoUrl);
        return this.filterCommitsBetween(commitData, startDate, endDate);
    }

    public async getCommitData(repoUrl: string): Promise<Array<CommitInfo>> {
        const key = this.stripRepoName(repoUrl);
        if (this.commitCache.has(key)) {
            return this.commitCache.get(key);
        }
        const rawData = await this.fileSystem.read("./data", `${key}.txt`);
        return JSON.parse(rawData) as Array<CommitInfo>;
    }

    public filterCommitsBefore(commits: Array<CommitInfo>, endDate: string): Array<CommitInfo> {
        return commits.filter((commit: CommitInfo) => {
            const commitDate: Date = new Date(commit.date);
            const lastDate: Date = new Date(endDate);
            return commitDate <= lastDate;
        });
    }

    public filterCommitsBetween(commits: Array<CommitInfo>, startDate: string, endDate: string): Array<CommitInfo> {
        return commits.filter((commit: CommitInfo) => {
            const commitDate: Date = new Date(commit.date);
            const minDate: Date = new Date(startDate);
            const maxDate: Date = new Date(endDate);
            return commitDate >= minDate && commitDate <= maxDate;
        });
    }

    private stripRepoName(repoUrl: string): string {
        const lastSlashIndex: number = repoUrl.lastIndexOf("/");
        return repoUrl.substring(lastSlashIndex + 1);
    }
}
