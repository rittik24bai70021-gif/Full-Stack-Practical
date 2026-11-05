# Frontend

From this folder run `npm.cmd start` on Windows (`npm start` on Linux/macOS). Open http://localhost:5173. Node.js 24+ is required. No npm install is needed. Start the backend in another terminal.

- index.html: shell and navigation
- styles.css: storefront, responsive layout and light/dark colours
- app.js: catalog, login, cart, order and admin screen logic; fetch connects to localhost:8080/api
- assets/: bundled book covers
- serve.mjs: local file server

## Optional frontend tests
Runtime still needs no npm install. To run DOM unit tests only, first install the pinned development dependency:
```powershell
npm.cmd install
npm.cmd test
```
The tests use jsdom 30.1.3, simulated HTTP responses and a simulated DOM; they do not run a real browser or mutate your database. They check notifications, order updates, dialog preservation, cancellation rendering, invoice downloads and offline recovery.
