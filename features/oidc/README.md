# Login with Open ID Connect (OIDC)

With this feature, Overleaf supports user login via OIDC.

Usually, Overleaf uses its own user management for creating profiles, managing projects and access rights and similar. It includes leftover code for supporting LDAP and SAML, but both are not fully included in the Community Edition. This feature implements OIDC using `passport-openidconnect`, allowing an external user management system to be connected to Overleaf.

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

All relevant URLs can be found at the `.well-known/openid-configuration` endpoint in your authentication provider.

## Installing

The entire user database needs to be adjusted to allow existing users to be logged in via OIDC without creating a new profile. This has to be done manually.

By default, Overleaf finds and matches users according to their `email` field. This feature creates and uses a new field called `oidcUID` instead, which gets filled by either the OIDC `sub` claim or the `user_id` claim as a fallback. Thus, it is required to add an `oidcUID` to existing users, otherwise new profiles will be created on the first login via OIDC. Additionally, an (unused) field `oidcUsername` is created, which allows administrators to find users based on username.

New users will be created automatically, and existing users will be updated with `first_name`, `last_name` and `email` provided by OIDC on login.

For migrating existing users, a script like the following can be used: (assuming `email-to-oidcUID.csv` is present in the current directory and the mongodb is forwarded to the localhost)
```py
from pymongo import MongoClient

# read translation file: email -> oidcUID in CSV
translation = {}
with open('email-to-oidcUID.csv') as f:
    for line in f:
        if line.count(',') != 1:
            print('Invalid line: ' + line)
            exit(1)
        email, oidcUID = line.strip().split(',')
        translation[email] = oidcUID

# connect to local mongodb
client = MongoClient("mongodb://127.0.0.1:27017/", 27017, replicaset='overleaf', directConnection=True)
# with replicase

# open sharelatex db
db = client['sharelatex']

success = 0
failure = 0

# add "oidcUID" to users based on email-mapping
users = db['users']
for user in users.find():
    if 'email' not in user:
        print('User: ' + str(user['_id']) + ' does not have email')
        failure += 1
        continue

    email = user['email']
    if email not in translation:
        print('User: ' + str(user['_id']) + ' email: ' + email + ' not found in translation file')
        failure += 1
        continue

    users.update_one({'_id': user['_id']}, {'$set': {'oidcUID': translation[email]}})
    success += 1

print('Success: ' + str(success))
print('Failure: ' + str(failure))
```

## Uninstalling

To uninstall/disable this feature, `OIDC_ENABLE` can be set to `false` or the respective commit can be removed from the history. No changes to the database or related code are required. When OIDC is disabled, users will be able to log in to their existing profiles according to the email address provided by OIDC at the time of their last login. Note that OIDC does not use or update the `hashedPassword` field, so users created via OIDC will not be able to login until they reset their password. The fields `oidcUID` and `oidcUsername` can remain in the database and will not be used/changed by Overleaf.
