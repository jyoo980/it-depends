import MethodDependencyBuilder from "../../src/services/MethodDependencyBuilder";

describe("MethodParser tests", () => {

    let mdb: MethodDependencyBuilder = new MethodDependencyBuilder();

    it("should obtain the java-practice repo file and get all the methods from that repo file", async () => {
        const sampleRepo: string = "https://github.com/jyoo980/java-practice";
        await mdb.execute(sampleRepo);
    });
});
