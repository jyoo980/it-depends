
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

    it("PUT /", () => {
       try {
           return chai.request("localhost:8080")
               .put("/")
               .send({url: "https://github.com/uslava77/test_it_depends"})
               .then((res: ChaiHttp.Response) => {
                   expect(res.status).to.be.equal(200);
                   expect(res.body).to.be.equal({
                       commits: [{sha: "224558aa2b008a4ae88a36f284ed4797fd78ac63", message: "Initial commit"},
                           {sha: "1d9a8403594e9ed1defbf1ab4661951d9e3f09e2", message: "helloworld"}]
                   });
               })
               .catch((err: any) => {
                   console.log("Test failed: " + err);
                   expect.fail();
               })
       } catch (err) {
            return;
       }
    });
});