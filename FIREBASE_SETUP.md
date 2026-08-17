# Voyager USA — Firebase setup

The application is connected to Firebase project `voyager-usa-ada71`.

- Email/password and Google authentication are enabled.
- Guest mode remains local.
- Deploy `firestore.rules` before publishing.
- Add the production website domain to Firebase Authentication authorized domains.
- Create the owner account, then assign its token the custom claim `admin: true` from a trusted server using Firebase Admin SDK.

Passwords are handled only by Firebase Authentication and are never saved in browser storage or Firestore.
