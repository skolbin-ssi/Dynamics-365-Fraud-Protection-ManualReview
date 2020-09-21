# Microsoft Dynamics 365 Fraud Protection - Manual review

## Main documents
* [Technical Specification](https://docs.google.com/document/d/1we5YZDPwda8MTp-6FHqsfEwEfzBZi_Wi3AeLrfzcaug/edit#heading=h.dydw8omr4619)
* [Proposal](https://docs.google.com/document/d/1GM1NtkZ2qSxgCh3ut1VMXAZh1P-HQVIHVyQEryYM7Y0)
* [Diagrams](https://drive.google.com/file/d/1V4Xfy-hfeOmLVxRL8nbNkMlKOX5_faiG/view?usp=sharing)
* [FE README](./frontend/README.md)
* [BE README](./backend/README.md)
* [Deployment README](./arm/README.md)

## Solution structure
![FunctionalSegregation](./documentation/pictures/MRStructureDiagrams-SolutionArchitecture.png)  

## Supplementary docs
* [Test users creation](https://docs.google.com/document/d/10u5hq0WaarxLu7n6h2TP3OB_Bjsg7_nrqO66Epqqwew)

## Contribution

Refer to our [jira](https://griddynamics.atlassian.net/secure/RapidBoard.jspa?rapidView=45) for the backlog.
If you are a newcomer please go through all project README files (including this one) and become acquanted with 
[Manual Review Technical Specification](https://docs.google.com/document/u/1/d/1we5YZDPwda8MTp-6FHqsfEwEfzBZi_Wi3AeLrfzcaug/edit?ts=5ee8741d&pli=1#heading=h.dydw8omr4619)
document before making any commits to the repository.

### Commits

Commits have to be descriptive and contain only changes related to the story which you picked for development.
Each commit must contain a tag at the begining of the commit message indicating where changes where made. 
`[BE]` for the `backend` module and `[FE]` for he `frontend` module accordinaly. You can look at the commit history
to find an example of a common commit.

### Branches

`master` branch is only used to push changes from the `development` branch before demo freeze. By doing that you
create a release version, thus you need to create a tag with the release version. Look at the github guidelines to
know how to create a tag. You may push more commits to the `master` branch after merging it with the `development`
branch, they are called _hotfix commits_. They have to be merged to the `development` branch before the next release.

`development` is a main branch where all features and bugs are pushed during the iteration. It's nearly always
in an actual state (exception is when hotfix commits are pushed directly into the `master` branch after the release cut).

`MDMR-123` - the candidate branch for the merge should point to an execting Jira story and have a name exactly 
the same as associated story ID.

### Pull requests

Any contribution should go through pull request review process. To commit new changes to the project you need
to clone the project and make a new branch from the `development` branch. Pull request should have a tag indicating 
where changes where made. `[BE]` for the `backend` module and `[FE]` for he `frontend` module accordinaly. Also it
should have a second tag refering to the Jira story `[MDMR-123]`. You can look at the pull requests history to find an 
example of a common pull request.

Creator of the pull request have to merge it himself after he gets an approve from another developer. To apply pull
request to the `development` branch recursive merge must be performed against the rebase or squash with rebase.

## Microsoft Open Source code of conduct

For additional information, see the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct).
