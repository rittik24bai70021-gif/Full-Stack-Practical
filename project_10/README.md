# Project 10 — BookVerse
## Online Bookstore Management System
**Rittik Basak · 24BAI70021**  
Full Stack–II • Experiment 10

BookVerse is a working local full-stack bookstore with a blue/white bookstore interface with a persistent dark theme, bundled book-cover images, responsive layouts, customer accounts, saved bookshelves, carts, orders and an admin studio.

## Start from zero (Windows / VS Code)
1. Install **Node.js 24 or newer** from https://nodejs.org. Node 24 is required for the built-in SQLite API. Restart VS Code after installation.
2. Extract the ZIP completely. Open the `project_10` folder in VS Code. Do not run files inside the ZIP.
3. Check the runtime: `node --version` (24 or newer) and `npm --version`.
4. Double-click `START_PROJECT.cmd`, or use the separate commands below.
5. Open **http://localhost:5173** after both servers print their URLs. Keep both terminals open.

No npm install, Maven, Java, Python, MongoDB or external database setup is needed. All code uses Node built-in modules and browser JavaScript. The chosen stack is not Spring Boot or React; the supplied assignment row does not prescribe a framework.

### Terminal 1 — backend (from project_10)
```powershell
cd backend
npm.cmd start
```
Backend: http://localhost:8080/api/health

### Terminal 2 — frontend (new terminal, from project_10)
```powershell
cd frontend
npm.cmd start
```
Frontend: http://localhost:5173

If already inside a subfolder, run `npm.cmd start` directly there. On macOS/Linux use `npm start` instead. `npm.cmd` avoids PowerShell script-execution-policy issues on Windows.

## Order workflow upgrade (28 October 2026)
New: in-app admin notifications, automatic customer order updates, downloadable HTML invoices, admin analytics and safe pre-packing cancellation. Read **docs/UPGRADE_AND_NEW_FEATURES.md** to keep existing data and demonstrate the full workflow.

## Redesigned version
Extract this ZIP to a new folder. Stop your earlier project servers before running this version. The ZIP contains no pre-used database; it initializes fresh demo data on first start.

## Demo accounts
| Role | Email | Password |
| --- | --- | --- |
| Customer | rittik@bookverse.local | Reader@123 |
| Administrator | admin@bookverse.local | Admin@123 |

Choose **Customer login** for the customer account and **Admin login** for the administrator. Admin sign-in opens the dashboard automatically; customer sign-in opens a welcome popup.

You may register new customer accounts. Public registration cannot create an admin. Sessions last 24 hours and the browser stores the token only for the current tab session. Signing out invalidates the token on the server.

## Folder guide
| Path | Purpose |
| --- | --- |
| frontend/index.html | Page shell, navigation, student identity, modal |
| frontend/styles.css | Responsive visual design and cover presentation |
| frontend/app.js | UI state, forms, filters, API requests and rendering |
| frontend/serve.mjs | Local static frontend server on port 5173 |
| backend/server.mjs | REST API, validation, authentication, roles, database, transactions |
| backend/seed.mjs | Twelve initial books |
| backend/test.mjs, backend/order-features.test.mjs | Automated integration checks using temporary databases |
| backend/order-features.mjs | Invoice HTML and analytics calculations |
| backend/data/bookverse.sqlite | Created automatically on first start; persistent app data |
| docs/DEMO_AND_VIVA.md | Presentation script and architecture explanation |
| docs/API.md | Routes and data model |
| docs/TEST_RESULTS.md | Checks completed and limitations |

## Included features
- Browse 12 seeded classics, view descriptions, search titles/authors, filter genres/moods, sort by price/title.
- Twelve bundled Project Gutenberg cover images; no external image requests at runtime. Admins can upload PNG/JPEG/WebP covers up to 1 MB.
- Registration, sign-in, hashed/salted passwords and protected API routes.
- Customer-specific persistent bag and saved bookshelf.
- Quantity controls, address validation, server-calculated totals and free delivery.
- Cash-on-delivery **academic demonstration** checkout; no real money or shipment processing.
- Atomic stock deduction: competing orders cannot oversell the last copy.
- Customer order history with Placed → Packed → Shipped → Delivered progress.
- Admin catalog create/read/update/remove, cover colours, stock counts and order stage updates.
- In-app admin notification bell with persistent per-admin read state; updates approximately every 10 seconds while the page is visible.
- Automatic customer status updates, manual refresh and connection recovery messaging.
- Customer cancellation before packing, with transactional stock restoration and safe duplicate-request handling.
- Downloadable HTML invoices; open and print or save as PDF.
- Pending/delivered/cancelled analytics, a seven-day chart and low-stock restock shortcuts.
- Low-stock indicator, order-value summary and random “Pick my next read” discovery.
- Your name and UID displayed in the top identity bar, footer and API health response.
- Separate Customer login and Admin login tabs, with role validation on the server.
- Personal reading-themed welcome dialog after customer login/registration.
- Persistent light/dark theme, budget filter and in-stock filter.

## Test the backend
In the backend terminal (a running application server can stay open on 8080):
```powershell
npm.cmd test
```
Tests use port 18080 and an isolated temporary database. They do not alter your application data.

## Data and troubleshooting
- A warning that SQLite is experimental in some Node versions is a runtime warning, not a failed startup.
- “node is not recognized”: install Node, then close/reopen VS Code.
- “No such built-in module node:sqlite”: upgrade to Node 24 or newer.
- Backend offline screen: start the backend and click Try again.
- EADDRINUSE: another process is using 8080 or 5173. Stop the old BookVerse terminals with Ctrl+C, then restart.
- To stop the application, press Ctrl+C in both terminals.
- To reset demo data, stop the backend, back up `backend/data`, then delete that folder and restart. This intentionally removes accounts, orders and inventory changes.
- To back up, stop the backend first and copy the complete `backend/data` folder.
- Prices are whole Indian rupees; no decimal prices, taxes or shipping fees are implemented.
- The browser and backend are configured for local use. Deployment, TLS, password recovery, payment gateways, real courier tracking and production administration are outside this academic version. Demo credentials must be replaced before any public deployment.
- Backend accepts requests from localhost:5173 and 127.0.0.1:5173 only. Use the documented URL rather than opening index.html with file://.

## Submission
Read and understand the implementation before your viva. The instructor's PDF also requires a 20–30 page project file appended to the lab manual; this ZIP contains source code and technical guides, **not that formal report**. Its final format was stated as forthcoming. Upload the extracted project/ZIP to your own Google Drive for submission when ready. No upload or public deployment has been performed.
