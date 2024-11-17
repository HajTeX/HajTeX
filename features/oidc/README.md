# `feature/oidc`

With this feature, Overleaf supports user login via OIDC.

Usually, Overleaf uses its own user management for creating profiles, managing projects and access rights and similar. It includes leftover code for supporting LDAP and SAML, but both are not fully included in the Community Edition. `feature/oidc` implements OIDC using `passport-openidconnect`, allowing an external user management system to be connected to Overleaf.

Note that Overleaf usually matches users by email address, while OIDC uses its own UID! Refer to [Installing](#Installing) for more information.

## Config options

- `OIDC_ENABLE`: `[true, false]`, enables/disables this feature entirely
- `OIDC_NAME_SHORT`: `String`, changes the name of the OIDC provider to be displayed in the navbar (`[NAME]-Login`)
- `OIDC_NAME_LONG`: `String`, variant of `OIDC_NAME_SHORT` to be displayed when more space is available (currently unused)
- `OIDC_ISSUER`: `URL`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_AUTHORIZATION_URL`: `URL`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_TOKEN_URL`: `URL`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_USERINFO_URL`: `URL`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_CLIENT_ID`: `String`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_CLIENT_SECRET`: `String`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)
- `OIDC_CALLBACK_URL`: `URL`, see the documentation of [OpenID-Connect-Core](https://openid.net/specs/openid-connect-core-1_0.html)

## Installing

The entire user database needs to be adjusted to allow existing users to be log in via OIDC without creating a new profile. This has to be done manually by adjusting the database appropriately.

By default, Overleaf finds and matches users according to their `email` field. This feature creates and uses a new field called `oidcUID` instead, containing the user ID as provided by the authentication provider. Thus, it is required to add this field to existing users, otherwise new profiles will be created on the first login via OIDC. Additionally, an (unused) field `oidcUsername` is created, to allow administrators to find users based on username, next to email address or ID.

New users will be created automatically, and existing users will be updated with `first_name`, `last_name` and `email` provided by OIDC on login.

## Uninstalling

To uninstall/disable this feature, `OIDC_ENABLE` can be set to `false` or the respective commit can be removed from the history. No changes to the database or related code are required. When OIDC is disabled, users will be able to log in to their existing profiles according to the email address provided by OIDC at the time of their last login. Note that OIDC does not use or update the `hashedPassword` field, so users created via OIDC will not be able to login until they reset their password. The field `oidcUID` can remain in the database and will not be used/changed by Overleaf.
