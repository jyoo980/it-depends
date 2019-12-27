# it-depends ![build-status](https://gitlab.com/jamesyoo/it-depends/badges/master/pipeline.svg)

![viz-screenshot](./media/it-depends-viz.png)

Developers often encounter trouble traversing the information space of a large software system with extensive revision history. Looking through a list of commits is time-consuming, and fails to convey information in a form which efficiently communicates information about the system. `it-depends` is a visualization which makes it easier for developers and managers to understand the dependencies between entities in a software system across commits.

[Link to visualization](https://daviidli.github.io/it-depends-vis/)

The link above will navigate to an instance of `it-depends`. Keep in mind that this is a PoC, and as such, there are bugs! Help us out by opening issues to report bugs! 🔍 🐛

## Dependencies
* yarn (>= v1.17.3)
* tsc (>= 3.6.3)

## Working with it-depends
* To build: `yarn build`
* To execute all tests: `yarn test`

## Contributors

For a more detailed breakdown of contributions, please read [here](./contributors.md)

* [Sam Veloso](https://github.com/scveloso)
* [Slava Uryumtsev](https://github.com/uslava77)
* [David Li](https://github.com/daviidli)
* [Kiyomi H](https://github.com/kiyomih)
* [James Yoo](https://github.com/jyoo980)

## Design work and user study results

You can read about the intent of our visualization, the original design, the outcomes of our prototype testing and resulting design changes, and the outcomes of our final end-user testing [here](./writeup.md). 
