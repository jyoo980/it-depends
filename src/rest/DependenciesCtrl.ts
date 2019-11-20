import restify = require('restify');
import {DependencyTypes} from "../model/DependencyMatrix";

export default class DependenciesCtrl {
    private server: restify.Server;

    /**
     * Initializes the dependencies server object
     */
    constructor() {
        this.server = restify.createServer({
            name: 'It-depends',
            version: '1.0.0'
        });
    }

    /**
     * Starts server, listens on port 8080.
     *
     * Note: we can update return value in promise to something more useful, currently void.
     * @returns {Promise<any>}
     */
    public async start(): Promise<any> {

        console.log("STARTING UP SERVER: " + this.server.name);

        this.server.use(restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify.plugins.queryParser());
        this.server.use(restify.plugins.bodyParser());

        // TODO: add endpoints for getting other data (e.g. initializing the visualization and getting commit info,
        // maybe another endpoint for 'flushing' data, if someone refreshes/ changes the git URL)

        // TODO: add endpoints for getting real data
        // possible format: /<graph-type>/<level>/:<startcommit SHA>..<endcommit SHA>

        // Temporary URL; can change the format once we have a better idea of what request URL should look like/
        // how we cache data, if that's something we will do.
        this.server.get('/crosscut/file/sample/:num', this.getCrossCutFileSampleData);
        this.server.get('/dependency/file/sample/:num', this.getDependencyFileSampleData);
        this.server.get('/crosscut/class/sample/:num', this.getCrossCutClassSampleData);
        this.server.get('/dependency/class/sample/:num', this.getDependencyClassSampleData);
        this.server.get('/crosscut/functions/sample/:num', this.getCrossCutFunctionSampleData);
        this.server.get('/dependency/functions/sample/:num', this.getDependencyFunctionSampleData);

        this.server.listen(8080, () => {
            console.log("SERVER LISTENING AT: " + this.server.url);
        });
    }

    /**
     * Stops server, useful for unit testing.
     *
     * Note: we can update return value in promise to something more useful, currently void.
     * @returns {Promise<any>}
     */
    public async stop(): Promise<any> {
        return this.server.close(() => {
            console.log("CLOSING SERVER");
        });
    }

    private getCrossCutFileSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/ model.
        let sampleData = {
            names: ["Foo.java", "Bar.java", "Baz.java"],
            data: [
                [1, 0.2, 0.8],
                [0.5, 1, 0.3],
                [0.7, 0.6, 1]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getDependencyFileSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/ model.
        let sampleData = {
            names: ["Foo.java", "Foo.java", "Bar.java"],
            data: [
                [[], [DependencyTypes.Aggregation], []],
                [[], [], [DependencyTypes.Inheritance]],
                [[], [], []]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getCrossCutClassSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/ model.
        let sampleData = {
            names: ["Foo", "Bar", "Baz"],
            data: [
                [1, 0.2, 0.8],
                [0.5, 1, 0.3],
                [0.7, 0.6, 1]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getDependencyClassSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/model.
        let sampleData = {
            names: ["Foo", "Bar", "Baz"],
            data: [
                [[], [DependencyTypes.Aggregation], []],
                [[], [], [DependencyTypes.Inheritance]],
                [[], [], []]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getCrossCutFunctionSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/ model.
        let sampleData = {
            names: ["Foo.function1", "Foo.function2", "Bar.function1"],
            data: [
                [1, 0.2, 0.8],
                [0.5, 1, 0.3],
                [0.7, 0.6, 1]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getDependencyFunctionSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
        // TODO: create more sample datasets to retrieve via sample URL.
        // TODO: set up a type/ model.
        let sampleData = {
            names: ["Foo", "Foo.function1", "Foo.function2", "Bar.function1", "Bar"],
            data: [
                [[], [], [DependencyTypes.Calls], [], []],
                [[], [], [DependencyTypes.Calls], [], []],
                [[], [], [], [], [DependencyTypes.References]],
                [[DependencyTypes.References], [], [], [], []],
                [[], [], [], [], []],
            ]
        };
        res.send(sampleData);
        return next();
    }
}

