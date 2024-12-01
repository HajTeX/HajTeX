# Features

This document summarizes how individual features should be created, documented and structured, enforcing a uniform style across all custom changes within HajTeX.

Please read [the contribution guideline](../CONTRIBUTING.md) first, which outlines requirements regarding features as well as basic rules regarding git setup and branch managing.

Most importantly, the following rule is established:
- Every feature is maintained in a `feature/<name>` branch

## Repository structure

- The `feature/<name>` branches should be based on the latest upstream release
- The number of commits should be low. Split where it makes sense, but fixups must be included in the existing commits
- Every feature must be documented in `features/<name>/README.md`
- If configuration options exist, they must be listed in `features/<name>/docker-compose.yml`

## Documentation

`features/<name>/README.md` must explain everything that an administrator needs to know. This includes, but is not limited to:
- A short description/explanation of the effect of this change/feature
- A list of additional configuration options with possible values and description
- Additional actions that need to be taken upon enabling or disabling this feature

An example file can be found below:
```md
# Example Feature

This adjustment does some important things that should be documented here.

Effectively, this changes how Overleaf behaves in ways that are listed in this document.

## Config options

- `ENABLE_EXAMPLE`: `[true, false]`, enables/disables the effect of this feature
- `VERY_IMPORTANT_VALUE`: `[0-100]`, changes the performance of the server, with `100` meaning "fast" and `0` meaning "slow"

OR

This feature cannot be configured or disabled through config options.

## Installing

During installation, the database has to be adjusted. All entries of `users` need to be deleted. This can be done with the following Mongo query:
`\``mongo
db.users.deleteMany({})
`\``

> [!CAUTION]
> Installing this feature is not revertible. Adjustments done during the installation process or while the feature is running effectively corrupt the database.
> Please think twice about whether you want to execute the code above!

OR

To enable this feature, no other changes are required.

## Uninstalling

After removing this feature, additional settings have to be reverted to allow Overleaf to work as before. This can be done with the following Mongo query:
`\``mongo
db.users.deleteMany({})
`\``

> [!CAUTION]
> Uninstalling this feature results in data loss. Information entered in the additional interfaces that this feature provides will be lost, even when re-installing this feature at a later point.
> Please back up your data before uninstalling this feature.

OR

To remove this feature, just remove the respective commit from your build. No changes on the database or related code are required.
Keep in mind that some users might expect that this feature exists, and will complain upon removal.
```

## Configuration

`features/<name>/docker-compose.yml` must set the default value and document all configuration options added in this feature. It is merged with the global `docker-compose.yml` using `-f`, as documented by [Merge Compose Files](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/).
- Configuration options should be listed as `environment` variables
- If additional changes in configuration are required (volumes, ports, additional services), they can be listed in the same file
- If no configuration options are added/required by this feature, this file must not exist

An example file can be found below:
```yml
services:
    sharelatex:
        environment:
            # enables or disables the `example` feature
            # [true, false]
            ENABLE_EXAMPLE: true

            # changes the performance of the server, with `100` meaning "fast" and `0` meaning "slow"
            # [0-100]
            VERY_IMPORTANT_VALUE: 100
```
