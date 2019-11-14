export interface FileInfo {
    name: string,
    additions: number,
    deletions: number,
}

export interface CommitInfo {
    sha: string,
    author: any,
    additions: number,
    deletions: number,
    filesChanged: Array<FileInfo>
}
