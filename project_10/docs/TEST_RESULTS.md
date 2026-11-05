# Validation — 28 October 2026
Runtime: Node.js 24.22.1 on Linux.

## Backend integration tests — PASS
Two node:test suites ran against real HTTP servers and isolated temporary SQLite databases. Existing authentication, role separation, CRUD, cover upload, cart, wishlist and checkout checks passed. New checks passed for placement/cancellation events, per-admin persisted read state, restart migration without duplicate events, protected invoices, escaped invoice text, original-price snapshots, owner-only cancellation, duplicate cancellation without double-restocking, packing/cancellation race outcomes, cancellation of archived books, terminal cancelled status, seven-day chart counts, pending counts and delivered-only value.

## Frontend DOM tests — PASS
Two jsdom suites execute the app with mocked HTTP responses and verify notification badges/toasts, read requests, analytics components, automatically changed customer order status, preservation of open dialogs, cancellation UI, invoice download filename and offline/recovery status. These are DOM unit tests, not browser end-to-end tests.

## Visual check
The new admin dashboard layout, cards, chart and low-stock panel were inspected in the browser using a rendered synthetic test fixture. Earlier storefront light/dark and separate login panel checks remain applicable.

## Limits
A complete authenticated two-window browser workflow was not exercised. Windows launchers and physical mobile devices were not run in Linux. Downloads are self-contained HTML invoices; the user can use their browser Print menu to save PDF. Polling is approximately every 10 seconds for visible tabs and requires a running backend. Payments and shipping remain academic demonstrations.
