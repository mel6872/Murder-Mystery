# Murder Mystery Role Picker — Fixed v2

## Roles included

- Detective
- Detective
- Detective
- Detective
- Murderer
- Decoy

## What is fixed

This version fixes the Create Game button/server connection issue in the previous package and improves the game flow.

### Game behaviour

1. The creator enters the roles.
2. The server securely shuffles the roles.
3. A public room link is created.
4. Everyone opens the same link.
5. Everyone sees numbered buttons.
6. Taken numbers become crossed out.
7. The server prevents a second person from claiming the same number.
8. Each player receives only the role attached to their chosen number.
9. The creator does not receive the hidden role mapping.
10. The creator can therefore play without knowing who the murderer is.

## IMPORTANT: this is a Node.js web app

Do NOT simply double-click `index.html`.

The Create Game button needs the Node server running.

### Local computer

Install Node.js, then in this folder run:

    npm install
    npm start

Then open:

    http://localhost:3000

For a WhatsApp group, the app needs to be deployed to a public HTTPS URL. A localhost address only works on your own computer.

## Security model

The server keeps the role mapping in memory and never sends the full mapping to normal players. A player receives a private token for their own claimed role.

This is designed for a casual private game. It is not a production-grade authentication/security system.

## Server restart

Rooms are stored in memory, so restarting/redeploying the server deletes active games.
