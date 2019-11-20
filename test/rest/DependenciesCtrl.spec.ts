
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

    it("GET /crosscut/sample", () => {
        try {
            return chai.request("localhost:8080")
                .get("/crosscut/class/sample/1")
                .then((res: ChaiHttp.Response) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.equal({
                        names: [ 'Foo', 'Bar', 'Baz' ],
                        data: [ [ 1, 0.2, 0.8 ], [ 0.5, 1, 0.3 ], [ 0.7, 0.6, 1 ] ] });
                })
                .catch((err: any) => {
                    console.log("Test failed: " + err);
                    expect.fail();
                });
        } catch (err) {
            return;
        }
    });

});