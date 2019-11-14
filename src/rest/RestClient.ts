export interface IRestError extends Error, IRestResponse {}

export interface IRestResponse {
    statusCode: number,
    body: any,
}

export interface IRestClient {
    get(url: string): Promise<IRestResponse>
}

export default class RestClient implements IRestClient {

    private readonly axios;

    constructor() {
        this.axios = require("axios");
    }

    public async get(url: string): Promise<IRestResponse> {
        try {
            const response = await this.axios.get(url);
            return { statusCode: response.status, body: response.data } as IRestResponse;
        } catch (err) {
            const msg: string = `RestClient::Error while reading resource (GET) at: ${url}`;
            const errorResponse = err.response;
            console.error(msg);
            throw { statusCode: errorResponse.status, body: errorResponse.statusText } as IRestError;
        }
    }
}
