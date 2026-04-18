# Upstream Releases

This document summarizes the release process of the
[Overleaf upstream project](https://github.com/overleaf/overleaf) as far as
we have reverse-engineered it.

- Releases are not tagged in the upstream git repository
- Releases are only published as Docker images at https://hub.docker.com/r/sharelatex/sharelatex/tags
- Release Notes are published in Wiki pages
  - 5.x.x: https://github.com/overleaf/overleaf/wiki/Release-Notes-5.x.x
  - 6.x.x: https://docs.overleaf.com/on-premises/release-notes/release-notes-6.x.x
- Before 6: The repository revision corresponding to a Docker image release can be extracted from The build log on Docker Hub or the image itself
  - On Docker Hub, visit the build log by clicking on the image hash in the [tag list](https://hub.docker.com/r/sharelatex/sharelatex/tags), then search for `MONOREPO_REVISION`
  - Or extract the hash from the image by running a command like `podman run --rm --entrypoint='["/bin/cat", "/var/www/revisions.txt"]' docker.io/sharelatex/sharelatex:5.1.1`
  - Both result in a commit hash like `a55d9fcf38755c6d982ddcbb0cd092b37d9879fa`
  - This commit can be found in the upstream repo https://github.com/overleaf/overleaf/tree/a55d9fcf38755c6d982ddcbb0cd092b37d9879fa
- After 6: The repository revision must be derived by checking the git changes around the tag release date
  - On Docker Hub, check the release date of the image to be researched
  - Look up the commits surrounding that date on GitHub
  - Locally, download the docker image and run `bash` within the container (`docker container run -it --entrypoint bash sharelatex/sharelatex:<version>`)
  - Pick out commits and see if their changes have already been applied on the docker filesystem. Find the exact cutoff commit, which is usually end-of-day one or few days before the release.
- Major (X.0.0) and minor (X.Y.0) releases are published as a new Docker image
- Patch releases (X.Y.Z) are built as new Docker tags based on the previous patch image, by adding a new `Dockerfile` with more commands to be appended at the end of the release process.
  - If file changes are required, `.patch` files are `COPY`d into the image and then applied via `RUN patch -p1`.
  - Sometimes, these changes affect directories outside of Overleaf itself (e.g. `/etc/nginx/site-enabled`) or do not have an associated `.patch` file.
  - `.patch` files and Dockerfiles are published at https://github.com/overleaf/overleaf/tree/main/server-ce/hotfix
