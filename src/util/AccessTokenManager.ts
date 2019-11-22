export default class AccessTokenManager {
    public static getGithubAccessToken() {
        return (process.env.GITHUB_API_KEY);
    }
}