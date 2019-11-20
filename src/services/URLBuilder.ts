export default class URLBuilder {

    private readonly accessToken: string;
    private readonly BASE_URL = "https://api.github.com/repos";

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/commits/:ref
     *
     * https://developer.github.com/v3/repos/commits/#get-a-single-commit
     *
     * @param repoUrl the url of the repo for which we want to build the URL
     * @param sha the commit for which we want to build the URL.
     */
    public buildGetSingleCommitUrl(repoUrl: string, sha: string) {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/commits/${sha}?access_token=${this.accessToken}`;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/branches/:branch
     *
     * https://developer.github.com/v3/repos/branches/#get-branch
     *
     * @param repoUrl the url of the repo for which we want to build the URL
     * @param branchName the branch for which we want to build the URL
     * defaults to "master" if none is provided.
     */
    public buildGetBranchUrl(repoUrl: string, branchName: string = "master"): string {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/branches/${branchName}?access_token=${this.accessToken}`;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/commits
     *
     * https://developer.github.com/v3/repos/commits/
     *
     * @param repoUrl the url of the repo for which we want to build the URL
     * @param endDate the date to which we list commits until (usually latest)
     * lists commits from master by default. Should be formatted in ISO-8601.
     * e.g. use new Date().toISOString();
     */
    public buildListCommitsUrl(repoUrl: string, endDate: string): string {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/commits?until=${endDate}&per_page=100&access_token=${this.accessToken}`;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/contributors
     *
     * @param repoUrl the url of the repo for which we want to build the URL
     */
    public buildListContributorsUrl(repoUrl: string): string {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/contributors`;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/contents/:path
     *
     * https://developer.github.com/v3/repos/contents/#get-contents
     *
     * @param repoUrl the url of the repo for which we want to build the url
     * @param filePath the path of the file we want to read
     * @param commitSHA the commit associated with the state of the file we want to read
     */
    public buildGetFileUrl(repoUrl: string, filePath: string, commitSHA: string): string {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/contents/${filePath}?ref=${commitSHA}`;
    }

    /**
     * Builds the request URL for getting a repo as a .zip file
     * GET /repos/:owner/:repo/:archive_format/:ref
     *
     * https://developer.github.com/v3/repos/contents/#get-archive-link
     *
     * @param repoUrl the url of the repo for which we want to build the url
     */
    public buildGetRepoUrl(repoUrl: string): string {
        const owner: string = this.getOwner(repoUrl);
        const repo: string = this.getRepoName(repoUrl);
        return `${this.BASE_URL}/${owner}/${repo}/zipball`;
    }

    private getOwner(repoUrl: string): string {
        const lastSlashIndex: number = repoUrl.lastIndexOf("/");
        const ownerStartIndex: number = repoUrl.lastIndexOf(".com/") +5;
        return repoUrl.substring(ownerStartIndex, lastSlashIndex);
    }

    public getRepoName(repoUrl: string): string {
        const lastSlashIndex: number = repoUrl.lastIndexOf("/");
        return repoUrl.substring(lastSlashIndex + 1);
    }
}
