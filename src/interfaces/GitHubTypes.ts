export interface FileInfo {
    name: string,
    additions: number,
    deletions: number,
    diff: PatchInfo,
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

export interface PatchInfo {
    name: string,
    linesAdded: string[],
    linesDeleted: string[],
}
