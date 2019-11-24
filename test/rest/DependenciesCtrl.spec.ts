
import { expect } from "chai";
import chai = require("chai");

import chaiHttp = require("chai-http");
import DependenciesCtrl from "../../src/rest/DependenciesCtrl";


describe("DepedenciesCtrl tests", () => {
    let ctrl: DependenciesCtrl = new DependenciesCtrl();
    chai.use(chaiHttp);

    before(async () => {
        ctrl = new DependenciesCtrl();
        await ctrl.start();
    });

    after(async () => {
        await ctrl.stop();
    });

    it("GET /dependency/file", () => {
        try {
            return chai.request("localhost:8080")
                .get("/dependency/file?start=3e6288124cce43a861603c331c9419531595f707&end=test2&url=https://github.com/scveloso/DNS-Resolver")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    console.log(res.body);
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    });

    it("GET /dependency/class", () => {
        try {
            return chai.request("localhost:8080")
                .get("/dependency/class?start=3e6288124cce43a861603c331c9419531595f707&end=test2&url=https://github.com/scveloso/DNS-Resolver")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    console.log(res.body);
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    });

    it("GET /crosscut/sample", () => {
        try {
            return chai.request("localhost:8080")
                .get("/crosscut/class/sample/1")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.deep.equal({
                        names: ["Foo", "Bar", "Baz"],
                        data: [
                            [1, 0.2, 0.8],
                            [0.5, 1, 0.3],
                            [0.7, 0.6, 1]
                        ]
                    });
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    });

    it("PUT /init", () => {
       try {
           return chai.request("localhost:8080")
               .put("/init")
               .query({url: "https://github.com/uslava77/test_it_depends"})
               .then((res: ChaiHttp.Response) => {
                   expect(res.status).to.be.equal(200);
                   console.log(res.body);
                   expect(res.body).to.have.key('commits');
                   expect(res.body.commits).to.have.lengthOf(3);
                   expect(res.body.commits[0]).to.include({sha: "3a8d4cde468da9bb6732597c1cead8bbacf68afc", message: "add comment"});
                   expect(res.body.commits[1]).to.include({sha: "1d9a8403594e9ed1defbf1ab4661951d9e3f09e2", message: "helloworld"});
                   expect(res.body.commits[2]).to.include({sha: "224558aa2b008a4ae88a36f284ed4797fd78ac63", message: "Initial commit"});
               })
               .catch((err: any) => {
                   console.log("Test failed: " + err);
                   expect.fail();
               })
       } catch (err) {
            return;
       }
    });

    it("GET /crosscut/file", () => {
        try {
            return chai.request("localhost:8080")
                .get("/crosscut/file?start=0&end=3&url=https://github.com/uslava77/test_it_depends")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    console.log(res.body);
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    });

    it("GET /crosscut/method", () => {

        try {
            return chai.request("localhost:8080")
                .get("/crosscut/method?start=0&end=3&url=https://github.com/uslava77/test_it_depends")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    console.log(res.body);
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    }).timeout(10000);
});