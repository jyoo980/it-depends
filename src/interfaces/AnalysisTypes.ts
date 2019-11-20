export interface AnalysisInfo {
    headings: Array<string>,
    size: number,
    type: AnalysisScope,
    data: Array<Array<number>>
}

export enum AnalysisScope {
    File,
    Class,
    Method
}