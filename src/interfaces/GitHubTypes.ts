export interface FileInfo {
    name: string,
    additions: number,
    deletions: number,
}

export interface CommitInfo {
    sha: string,
    author: any,
    message: string,
    date: string,
    additions: number,
    deletions: number,
    filesChanged: Array<FileInfo>
}
