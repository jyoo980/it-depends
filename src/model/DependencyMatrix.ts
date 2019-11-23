export enum DependencyTypes {
    Association = "association", // HASA
    Inheritance = "inheritance", // extends
    Implementation = "implementation", // implements
    Dependency = "dependency", // general dependency (usage)
    References = "references", // file references
    Calls = "calls" // calls method
}

export class DependencyMatrix {
    names: Array<string>;
    data: Array<Array<Array<DependencyTypes>>>;
}