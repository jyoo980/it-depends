import {PatchInfo} from "../interfaces/GitHubTypes";

export default class PatchParser {

    private readonly DELIMITER = "\n";

    public extractPatchInfo(name: string, filePatch: string): PatchInfo {
        let linesAdded: string[] = [];
        let linesDeleted: string[] = [];
        if (filePatch !== undefined) {
            const patchLines: string[] = filePatch.split(this.DELIMITER).filter((line: string) => line.length > 0);
            patchLines.forEach((line: string) => {
                return this.populateChangedLineArrays(line, linesAdded, linesDeleted);
            });
            return { name: name, linesAdded: linesAdded, linesDeleted: linesDeleted } as PatchInfo;
        }
        return {} as PatchInfo;
    }

    private populateChangedLineArrays(line: string, linesAdded: string[], linesDeleted: string[]) {
        if (this.isAddition(line)) {
            return linesAdded.push(line.replace(/[ +]/g, ''));
        } else if (this.isDeletion(line)) {
            return linesDeleted.push(line.replace(/[ -]/g, ''));
        }
    }

    private isAddition(loc: string): boolean {
        return loc[0] === "+";
    }

    private isDeletion(loc: string): boolean {
        return loc[0] === "-";
    }
}
