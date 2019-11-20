import FileSystem from "../util/FileSystem";



export default abstract class AbstractDependencyGraphBuilder {
    protected fileSystem: FileSystem;

    constructor() {
        this.fileSystem = new FileSystem();
    }

    protected initializeEmptyMatrix(size: number) {
        let matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for(let j = 0; j < size; j++) {
                matrix[i][j] = [];
            }
        }
        return matrix;
    }

}