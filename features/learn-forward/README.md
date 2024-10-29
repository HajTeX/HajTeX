# `feature/learn-forward`

This adjustment forwards all URLs starting with `/learn/...` to the official overleaf docs.

As this documentation is not part of community-releases of Overleaf, self-hosted instances usually throw a `404` error.
With this change in configuration, the Overleaf-internal `nginx` responds with a `308 Permanent Redirect` to `https://www.overleaf.com/learn/...`,
which often performs one more redirect to point to the actual documentation.

## Config options

This feature cannot be configured or disabled through config options.

## Installing

To enable this feature, no other changes are required.

## Uninstalling

To remove this feature, just remove the respective commit from your build. No changes on the database or related code are required.
