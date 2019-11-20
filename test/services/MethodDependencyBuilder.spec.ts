import MethodDependencyBuilder from "../../src/services/MethodDependencyBuilder";
import {expect} from "chai";

describe("MethodDependencyBuilder tests", function () {
    this.timeout(10000);
    let mdb: MethodDependencyBuilder = new MethodDependencyBuilder();

    it("a method that was changed in three commits should contain those three commits", async () => {
        let getResultsMethod = "src/ca/ubc/cs/cs317/dnslookup/DNSLookupService.java/getResults";
        let equalsMethod = "src/ca/ubc/cs/cs317/dnslookup/ResourceRecord.java/equals";
        let getNameFromPointerMethod = "src/ca/ubc/cs/cs317/dnslookup/DNSLookupService.java/getNameFromPointerInBuffer";

        const sampleRepo: string = "https://github.com/scveloso/DNS-Resolver";
        let headMethodsMap = await mdb.execute(sampleRepo);

        expect(headMethodsMap[getResultsMethod].commitsChangedIn.length).to.equal(3);
        expect(headMethodsMap[getResultsMethod].commitsChangedIn).to.contain("3e6288124cce43a861603c331c9419531595f707");
        expect(headMethodsMap[getResultsMethod].commitsChangedIn).to.contain("a7b4613e663d8d17d3146f345aede907255ee251");
        expect(headMethodsMap[getResultsMethod].commitsChangedIn).to.contain("2fa370b3105af3d7105cc3c8eb7a5bec0c12cda0");

        expect(headMethodsMap[equalsMethod].commitsChangedIn.length).to.equal(1);
        expect(headMethodsMap[equalsMethod].commitsChangedIn).to.contain("2fa370b3105af3d7105cc3c8eb7a5bec0c12cda0");

        expect(headMethodsMap[getNameFromPointerMethod].commitsChangedIn.length).to.equal(2);
        expect(headMethodsMap[getNameFromPointerMethod].commitsChangedIn).to.contain("3e6288124cce43a861603c331c9419531595f707");
        expect(headMethodsMap[getNameFromPointerMethod].commitsChangedIn).to.contain("a7b4613e663d8d17d3146f345aede907255ee251");

describe("MethodParser tests", () => {

    let mdb: MethodDependencyBuilder = new MethodDependencyBuilder();

    it("should obtain the java-practice repo file and get all the methods from that repo file", async () => {
        //const sampleRepo: string = "https://github.com/scveloso/DNS-Resolver";
        const sampleRepo: string = "https://github.com/jyoo980/java-practice";
        await mdb.execute(sampleRepo);
    });
});
