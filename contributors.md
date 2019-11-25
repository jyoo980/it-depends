# Contribution breakdown

This document serves as a general breakdown of tasks + contributions performed by each developer of `it-depends`. If any further details are required, please do not hesitate to contact any of the developers listed.

## [Sam Veloso](https://github.com/scveloso)

## [Slava Uryumtsev](https://github.com/uslava77)

## [David Li](https://github.com/daviidli)

## [Kiyomi KH](https://github.com/kiyomih)

## [James Yoo](https://github.com/jyoo980)

I worked on the logic which ingests data from the GitHub API into our application. Specifically, I had to work on business logic which would minimize the number of calls made to the API service, since this would likely slow down our system. I also implemented the cache in which the system stores the ingested data, and worked on the initial parsing of the information returned from GitHub into an easier-to-work-with form.

## Selected Contributions
* `GithubService.ts`
* `ResponseParser.ts`
* `GitCommitCache.ts`
