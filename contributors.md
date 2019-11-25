# Contribution breakdown

This document serves as a general breakdown of tasks + contributions performed by each developer of `it-depends`. If any further details are required, please do not hesitate to contact any of the developers listed.

## [Sam Veloso](https://github.com/scveloso)

I worked on extracting information required for building dependencies across methods of a project. This involved an algorithm that, for all methods at a certain commit of a project, get all the previous commits that each method was changed in. In addition, for each of those methods, which of the other methods does it call (depend on). ```MethodParser.ts``` extracted methods using lexical analysis from a project while ```MethodDependencyBuilder.ts``` built the actual dependencies across the methods. 

## Selected Contributions
* `MethodParser.ts`
* `MethodDependencyBuilder.ts`
* `Method.ts`

## [Slava Uryumtsev](https://github.com/uslava77)

## [David Li](https://github.com/daviidli)

## [Kiyomi KH](https://github.com/kiyomih)

## [James Yoo](https://github.com/jyoo980)

I worked on the logic which ingests data from the GitHub API into our application. Specifically, I had to work on business logic which would minimize the number of calls made to the API service, since this would likely slow down our system. I also implemented the cache in which the system stores the ingested data, and worked on the initial parsing of the information returned from GitHub into an easier-to-work-with form.

## Selected Contributions
* `GithubService.ts`
* `ResponseParser.ts`
* `GitCommitCache.ts`
