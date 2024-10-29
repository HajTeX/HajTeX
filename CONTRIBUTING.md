# Contributing to HajTeX

HajTex is a community-fork of Overleaf, a web-based collaborative LaTeX editor.
This document outlines our development process.

## Feature Contribution & Maintenance

"Feature" in the context of this documentation is a set of changes that adds or changes functionality,
design or another aspect of the upstream project.

Examples of features are OIDC-login, a custom design or isolated compiles.

Adding features that are not supported by upstream brings benefits to our users, but also increases
the maintenance burden.
Therefore, we have a few requirements for including new features in HajTeX:

- Features should generally minimize changes to the codebase
- Features should not depend on each other
- Removing or disabling a feature after enabling it must not break the application
  - If manual changes are required after disabling a feature, these must be documented
- Features should be individually toggleable on or off by a config flag and are enabled by default, if no external components are required
- New features should be validated in production before being merged

Each feature has one maintainer and any number of co-maintainers.
The maintainer is expected to fix any compatibility problems that may arise when
upstream publishes a new release within four weeks of that release.
If the maintainer does not manage that or is unresponsive and
no other person steps up to maintain the feature in the future,
the feature may be dropped to ensure the project can follow upstream releases within a reasonable timeframe.
Security releases may require an accelerated timeframe.

Dropping features that have already been released as part of HajTeX is considered a last-resort option
and other maintainers should make reasonable effort to continue supporting all features.

## HajTeX Releases

The HajTeX project follows the upstream releases of Overleaf. Details on the
upstream release process can be found in the [upstream release documentation](docs/upstream_releases.md).

We create proper git branches & tags for upstream releases:

- On a new Major/MinorRelease, extract the upstream commit from the Docker image.
  Create a branch `release/vX.Y.Z` from that commit & tag the commit with `vX.Y.Z-upstream`
- On a new Patch-Release, create a branch `release/vX.Y.Z` from the previous `vX.Y.Z-upstream` tag.
  Find the commit associated with each instruction in the updated Dockerfile from `overleaf/overleaf`.
  Example:
    - https://github.com/overleaf/overleaf/blob/main/server-ce/hotfix/5.1.1/pr_19612.patch
    - https://github.com/overleaf/overleaf/commit/cf83990459a4f4fdc1ab26aaf2b269fd756f261b#diff-e1885bbeacd51240ce7b5a12d34a4b66a0458c3282209531802ff4f3701c87ac
  This not only applies to `.patch` files, but also all other instructions in the hotfix `Dockerfile`, such as `npm uninstall`, removal or `chmod` of directories, ...
  Finally, apply the relevant commits as `cherry-pick`s on top of the last major/minor/patch.
  Tag the last commit with `vX.Y.Z-upstream`.

## Repository Structure

- The `main` branch contains only HajTeX-specific documentation
- Every feature is maintained in a `feature/<name>` branch
- After a new upstream release, a new `release/vX.Y.Z` branch is created and the release is
  tagged with `vX.Y.Z-upstream`
  - Each feature branch can then be rebased on the new upstream code
  - After a feature has been tested on the new release, the feature can be merged into the
    `release/vX.Y.Z` branch
  - When all features are merged, the tag `vX.Y.Z` can be created
- This results in two tags per upstream release: one tag `vX.Y.Z-upstream` for the unmodified
  upstream code and one tag `vX.Y.Z` for the corresponding HajTeX release
- New features should be developed based on the latest release branch
