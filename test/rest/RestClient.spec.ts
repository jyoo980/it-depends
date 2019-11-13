import { expect } from "chai";
import RestClient, {IRestResponse} from "../../src/rest/RestClient";

describe("RestClient tests", () => {

    let client: RestClient;

    before(() => {
        client = new RestClient();
    });

    it("should perform a simple GET request and return 200 OK", async () => {
        const sampleUrl: string = `http://api.mathjs.org/v4/?expr=${encodeURIComponent("5+4")}`;
        let response: IRestResponse;
        try {
            response = await client.get(sampleUrl);
        } catch (err) {
            console.warn(`RestClient Spec::Simple GET test should not have failed with error: ${err}`);
        } finally {
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal(9);
        }
    });

    it("should throw a response of type IRestError given an incorrect url", async () => {
        const badUrl: string = `http://api.mathjs.org/v4/?expr=not_encoded`;
        let response: IRestResponse;
        try {
            response = await client.get(badUrl);
        } catch (err) {
            response = err;
        } finally {
            expect(response.statusCode).to.equal(400);
            expect(response.body).to.equal("Bad Request");
        }
    })
});
