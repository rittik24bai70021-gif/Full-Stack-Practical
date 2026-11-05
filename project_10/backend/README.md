# Backend

From this folder run `npm.cmd start` on Windows (`npm start` on Linux/macOS). Check http://localhost:8080/api/health. Node.js 24+ is required. No npm install is needed.

- server.mjs: HTTP routing, request validation, sessions, permissions and SQLite queries
- seed.mjs: initial twelve-book catalog
- order-features.mjs: invoice generation and analytics
- test.mjs and order-features.test.mjs: integration tests (`npm.cmd test`)
- data/: database created automatically at runtime; do not delete to keep orders and users

See ../docs/API.md for every route and ../docs/DEMO_AND_VIVA.md for the presentation walkthrough.
