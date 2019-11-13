export default class URLBuilder {

    private readonly owner: string;
    private readonly repo: string;
    private readonly BASE_URL = "https://api.github.com/repos";

    constructor(repoUrl: string) {
        const lastSlashIndex: number = repoUrl.lastIndexOf("/");
        this.owner = repoUrl.substring(repoUrl.indexOf(".com/") + 5, lastSlashIndex);
        this.repo = repoUrl.substring(lastSlashIndex + 1);
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/commits/:ref
     *
     * https://developer.github.com/v3/repos/commits/#get-a-single-commit
     *
     * @param sha the commit for which we want to build the URL.
     */
    public buildGetSingleCommitUrl(sha: string) {
        return `${this.BASE_URL}/${this.owner}/${this.repo}/commits/${sha}`;
    }

    /**
     * Builds the request URL for
     * GET /repos/:owner/:repo/branches/:branch
     *
     * https://developer.github.com/v3/repos/branches/#get-branch
     *
     * @param branchName the branch for which we want to build the URL
     * defaults to "master" if none is provided.
     */
    public buildGetBranchUrl(branchName: string = "master"): string {
        return `${this.BASE_URL}/${this.owner}/${this.repo}/branches/${branchName}`;
    }

    /**
     * TODO
     * Currently, the API supports making the following call -- GET /repos/:owner/:repo/commits,
     * where we can specify getting a list of commits starting from a date and ending with a date.
     * However, the commit object(s) returned by that call is incomplete, they don't contain the files changed.
     * Here's a workaround:
     *  1. GET master branch - strip off time from that.
     *  2. GET /repos/:owner/:repo/commits - with the time range from start of the repo to the latest commit (from 1).
     *  3. Make multiple GET calls to read the info for the individual commits.
     *  ... this could get expensive very fast.
     */

}
