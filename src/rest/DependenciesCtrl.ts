import restify = require('restify');
import {DependencyTypes} from "../model/DependencyMatrix";
import FileDependencyGraphBuilder from "../services/FileDependencyGraphBuilder";
import URLBuilder from "../services/URLBuilder";
import AccessTokenManager from "../util/AccessTokenManager";
import GithubService from "../services/GithubService";
import RestClient from "./RestClient";
import GitCommitCache from "../services/GitCommitCache";
import CrossCutAnalyzer from "../services/CrossCutAnalyzer";
import {CommitInfo} from "../interfaces/GitHubTypes";
import ClassDependencyGraphBuilder from "../services/ClassDependencyGraphBuilder";
import corsMiddleware = require('restify-cors-middleware');

export default class DependenciesCtrl {
    private server: restify.Server;
    private static ghService: GithubService;

    /**
     * Initializes the dependencies server object
     */
    constructor() {
        this.server = restify.createServer({
            name: 'It-depends',
            version: '1.0.0'
        });

        const cors = corsMiddleware({
            preflightMaxAge: 5, //Optional
            origins: ['https://daviidli.github.io'],
            allowHeaders: [],
            exposeHeaders: []
          });
           
          this.server.pre(cors.preflight);
          this.server.use(cors.actual);

        DependenciesCtrl.ghService = new GithubService(new RestClient(), new GitCommitCache());
    }

    /**
     * Starts server, listens on port 8080.
     *
     * @returns {Promise<any>}
     */
    public async start(): Promise<any> {

        console.log("STARTING UP SERVER: " + this.server.name);

        this.server.use(restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify.plugins.queryParser());
        this.server.use(restify.plugins.bodyParser());
        this.server.use(restify.plugins.queryParser({ mapParams: true }));

        // TODO: add endpoints for getting other data (e.g. initializing the visualization and getting commit info,
        // maybe another endpoint for 'flushing' data, if someone refreshes/ changes the git URL)
        this.server.put('/init', this.initURL);

        // TODO: add endpoints for getting real data
        // format: /:graph-type/:level?start=<startSHA>&end=<endSHA>&url=<repoURL>
        this.server.get('/dependency/file', this.getFileDependencyGraphData);
        this.server.get('/dependency/class', this.getClassDependencyGraphData);
        this.server.get('/dependency/method', this.getMethodDependencyGraphData);
        this.server.get('/crosscut/file', this.getFileCrossCutGraphData);
        this.server.get('/crosscut/method', this.getMethodCrossCutGraphData);

        // Temporary URL; can change the format once we have a better idea of what request URL should look like/
        // how we cache data, if that's something we will do.
        this.server.get('/crosscut/file/sample/:num', this.getCrossCutFileSampleData);
        this.server.get('/dependency/file/sample/:num', this.getDependencyFileSampleData);
        this.server.get('/crosscut/class/sample/:num', this.getCrossCutClassSampleData);
        this.server.get('/dependency/class/sample/:num', this.getDependencyClassSampleData);
        this.server.get('/crosscut/functions/sample/:num', this.getCrossCutFunctionSampleData);
        this.server.get('/dependency/functions/sample/:num', this.getDependencyFunctionSampleData);

        this.server.listen((process.env.PORT || 8080), () => {
            console.log("SERVER LISTENING AT: " + this.server.url);
        });
    }

    /**
     * Stops server, useful for unit testing.
     *
     * @returns {Promise<any>}
     */
    public async stop(): Promise<any> {
        return this.server.close(() => {
            console.log("CLOSING SERVER");
        });
    }

    private async getFileDependencyGraphData(req: restify.Request, res: restify.Response, next: restify.Next) {

        let graphBuilder : FileDependencyGraphBuilder  = new FileDependencyGraphBuilder();
        let urlBuilder : URLBuilder = new URLBuilder(AccessTokenManager.getGithubAccessToken());
        let repoName = urlBuilder.getRepoName(req.query.url);
        let data;
        try {
            await DependenciesCtrl.ghService.getAndSaveRepo(req.query.url, req.query.end);
            data = await graphBuilder.getDependenciesFromProject("./data", repoName, req.query.end);
            res.send(data);
        } catch (err) {
            res.status(500);
            console.log(err);
            res.send(err.message);
        }
        return next();
    }

    private async getClassDependencyGraphData(req: restify.Request, res: restify.Response, next: restify.Next) {
        let graphBuilder : ClassDependencyGraphBuilder  = new ClassDependencyGraphBuilder();
        let urlBuilder : URLBuilder = new URLBuilder(AccessTokenManager.getGithubAccessToken());
        let repoName = urlBuilder.getRepoName(req.query.url);
        let data;
        try {
            await DependenciesCtrl.ghService.getAndSaveRepo(req.query.url, req.query.end);
            data = await graphBuilder.getDependenciesFromProject("./data", repoName, req.query.end);
            res.send(data);
        } catch (err) {
            res.status(500);
            console.log(err);
            res.send(err.message);
        }
        return next();
    }

    private async getMethodDependencyGraphData(req: restify.Request, res: restify.Response, next: restify.Next) {
        let urlBuilder : URLBuilder = new URLBuilder(AccessTokenManager.getGithubAccessToken());
        let repoName = urlBuilder.getRepoName(req.query.url);

        res.status(500);
        res.send("This endpoint is still being built!");
        return next();
    }

    private async getMethodCrossCutGraphData(req: restify.Request, res: restify.Response, next: restify.Next) {
        let analysisInfo;
        let ccAnalyzer = new CrossCutAnalyzer();
        try {
            analysisInfo = await ccAnalyzer.getMethodCrossCut(req.query.url, DependenciesCtrl.ghService,
                req.query.start, req.query.end);
            res.send(analysisInfo);
        } catch (err) {
            res.status(500);
            console.log(err);
            res.send(err.message);
        }
        return next();
    }
    private async getFileCrossCutGraphData(req: restify.Request, res: restify.Response, next: restify.Next) {
        let commits;
        let ccAnalyzer = new CrossCutAnalyzer();
        try {
            commits = await DependenciesCtrl.ghService.listCommitsBetween(req.query.url, req.query.start, req.query.end); // TODO await?
            res.send(ccAnalyzer.getFileCrossCut(commits));
        } catch (err) {
            res.status(500);
            console.log(err);
            res.send(err.message);
        }

        return next();
    }

    private async initURL(req: restify.Request, res: restify.Response, next: restify.Next) {
        //this.ccAnalyzer = new CrossCutAnalyzer();
        let commits: Array<CommitInfo>;
        try {
            commits = await DependenciesCtrl.ghService.getAndSaveAllCommits(req.query.url);
            res.send({commits: commits});
        } catch (err) {
            res.status(500);
            console.log(err);
            res.send(err.message);
        }
        return next();
    }

    private getCrossCutFileSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
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
        let sampleData = {
            names: ["Foo.java", "Foo.java", "Bar.java"],
            data: [
                [[], [DependencyTypes.Association], []],
                [[], [], [DependencyTypes.Inheritance]],
                [[], [], []]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getCrossCutClassSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
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
        let sampleData = {
            names: ["Foo", "Bar", "Baz"],
            data: [
                [[], [DependencyTypes.Association], []],
                [[], [], [DependencyTypes.Inheritance]],
                [[], [], []]
            ]
        };
        res.send(sampleData);
        return next();
    }

    private getCrossCutFunctionSampleData(req: restify.Request, res: restify.Response, next: restify.Next) {
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

    public static getGHService(): GithubService {
        if (DependenciesCtrl.ghService === undefined) {
            DependenciesCtrl.ghService = new GithubService(new RestClient(), new GitCommitCache());
        }
        return DependenciesCtrl.ghService;
    }
}

