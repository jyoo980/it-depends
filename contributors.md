# Contribution breakdown

This document serves as a general breakdown of tasks + contributions performed by each developer of `it-depends`. If any further details are required, please do not hesitate to contact any of the developers listed.

## [Sam Veloso](https://github.com/scveloso)

I worked on extracting information required for building dependencies across methods of a project. This involved an algorithm that, for all methods at a certain commit of a project, get all the previous commits that each method was changed in. In addition, for each of those methods, which of the other methods does it call (depend on). ```MethodParser.ts``` extracted methods using lexical analysis from a project while ```MethodDependencyBuilder.ts``` built the actual dependencies across the methods. 

#### Selected Contributions
* `MethodParser.ts`
* `MethodDependencyBuilder.ts`
* `Method.ts`

## [Slava Uryumtsev](https://github.com/uslava77)

## [David Li](https://github.com/daviidli)

I worked on creating the frontend and the visualization. The code for the frontend can be found in this [repo](https://github.com/daviidli/it-depends-vis). The main UI elements of the frontend are created using React.js and [Material UI React Components](https://material-ui.com/). The actual visualization is made with d3.js using d3's [force directed graph layout](https://github.com/d3/d3-force). 

#### Selected Contributions (in [it-depends-vis](https://github.com/daviidli/it-depends-vis))
* `Visualization.tsx`
* `App.tsx`

## [Kiyomi H](https://github.com/kiyomih)

I worked on the initial setup for the backend server that the frontend can retrieve data to create the visualization from. This also included adding endpoints for the frontend to retrieve sample data to solidify the data contract between frontend and backend, and adding endpoints for retrieving dependency graph information. In addition to this, I worked on building file-level and class-level dependency graph data matrices. The file-level dependency graph is a simple dependency checker, that considers whether other files are mentioned in some file, while the class-level dependency graph creates a graph with different types of edges (association, inheritance, implementation, and dependency). This graph can be viewed alongside the cross-cut graph data to see whether there is any correlation between dependencies and the likelihood that some file/class is changed at the same time as another file/class.

#### Selected Contributions
* `DependenciesCtrl.ts`
* `FileDependencyGraphBuilder.ts`
* `ClassDependencyGraphBuilder.ts`

## [James Yoo](https://github.com/jyoo980)

I worked on the logic which ingests data from the GitHub API into our application. Specifically, I had to work on business logic which would minimize the number of calls made to the API service, since this would likely slow down our system. I also implemented the cache in which the system stores the ingested data, and worked on the initial parsing of the information returned from GitHub into an easier-to-work-with form.

#### Selected Contributions
* `GithubService.ts`
* `ResponseParser.ts`
* `GitCommitCache.ts`
