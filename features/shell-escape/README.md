# Enable Shell Escape

This adjustments changes the options passed to the LaTeX compiler to include `-shell-escape`.

This allows packages like `minted`, `svg`, `graphviz`, `pgfplots` and similar to run shell commands during the compiling process.

> [!CAUTION]
> This feature allows arbitrary shell commands to be executed on the machine compiling the LaTeX documents.
> Obviously, this poses a heavy security risk. It should only be used in combination with features like `feature/sandboxed-compiles`
> that create a sandboxed environment around the compiler, to avoid users from taking over the server!

## Config options

This feature cannot be configured or disabled through config options.

## Installing

To enable this feature, no other changes are required. Make sure that appropriate protection against unauthorized access is in place!

## Uninstalling

To remove this feature, just remove the respective commit from your build. No changes on the database or related code are required.
Keep in mind that user's projects might fail to compile though, if they require shell-escape to be enabled.
