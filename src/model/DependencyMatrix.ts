export enum DependencyTypes {
    Association = "association",
    Inheritance = "inheritance",
    Implementation = "implementation",
    Dependency = "dependency",
    Aggregation = "aggregation",
    Composition = "composition",
    References = "references",
    Calls = "calls"
}

export class DependencyMatrix {
    names: Array<string>;
    data: Array<Array<Array<DependencyTypes>>>;
}