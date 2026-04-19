# HajTeX Branding

This adjustment changes the color scheme and logos used throughout Overleaf to represent HajTeX instead.

Effectively, this changes how all of Overleaf looks.

## Config options

This feature cannot be configured or disabled through config options.

## Installing

To enable this feature, no other changes are required.

## Uninstalling

To remove this feature, just remove the respective commit from your build. No changes on the database or related code are required.

## Notes

For updating texts and translations, execute the following search-and-replace within VSCode:
- Search: `"(.*)": "(.*)overleaf(.*)"`
- Replace: `"$1": "$2HajTeX$3"`
- Includes: `services/web/locales`
