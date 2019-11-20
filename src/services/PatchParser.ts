import {DiffHunk, PatchInfo} from "../interfaces/GitHubTypes";

export default class PatchParser {

    private readonly DELIMITER = "\n";

    public extractPatchInfo(name: string, filePatch: string): PatchInfo {
        let linesAdded: string[] = [];
        let linesDeleted: string[] = [];
        let diffHunks: DiffHunk[] = [];
        if (filePatch !== undefined) {
            const patchLines: string[] = filePatch.split(this.DELIMITER).filter((line: string) => line.length > 0);
            patchLines.forEach((line: string) => {
                return this.populateChangedLineArrays(line, linesAdded, linesDeleted, diffHunks);
            });
            return { name: name, linesAdded: linesAdded, linesDeleted: linesDeleted, diffHunks: diffHunks } as PatchInfo;
        }
        return {} as PatchInfo;
    }

    private populateChangedLineArrays(line: string,
                                      linesAdded: string[],
                                      linesDeleted: string[],
                                      diffHunks: DiffHunk[]) {
        if (this.isAddition(line)) {
            return linesAdded.push(line.replace(/[ +]/g, ''));
        } else if (this.isDeletion(line)) {
            return linesDeleted.push(line.replace(/[ -]/g, ''));
        } else if (this.isDiffMarker(line)) {
            return diffHunks.push(this.extractDiffHunkFromLine(line));
        }
    }

    private isAddition(loc: string): boolean {
        return loc[0] === "+";
    }

    private isDeletion(loc: string): boolean {
        return loc[0] === "-";
    }

    private isDiffMarker(loc: string): boolean {
        return loc.substr(0, 2) === "@@";
    }

    private extractDiffHunkFromLine(line: string): DiffHunk {
        let lineArr = line.split(" ");
        let newFileLineNumbers = lineArr[2].split(",");
        let start = +newFileLineNumbers[0];
        let numLinesChanged = +newFileLineNumbers[1];

        return { start: start, end: (start + numLinesChanged) } as DiffHunk;
    }
}
