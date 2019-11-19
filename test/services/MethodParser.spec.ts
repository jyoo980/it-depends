import { expect } from "chai";
import MethodParser from "../../src/services/MethodParser";

describe("MethodParser tests", () => {

    let methodParser: MethodParser = new MethodParser();

    // TODO: Have actual tests here, waiting on unzip functionality from James so we can
    // have test projects as zip files
    it("should return a list of commits up to the latest commit", async () => {
        let projStr = '../../../src/ca/ubc/cs/cs317/dnslookup/';

        console.log(methodParser.getMethodsFromProject(projStr));
    });
});
