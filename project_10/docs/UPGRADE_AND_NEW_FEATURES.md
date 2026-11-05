# BookVerse — order workflow upgrade
Rittik Basak · 24BAI70021 · 28 October 2026

## Keep your existing data
1. Stop BOTH old servers with Ctrl+C.
2. Back up the old project folder, especially `backend/data`.
3. Extract the new ZIP into a separate folder.
4. Before starting the new backend, copy the old `backend/data` folder into the new `project_10/backend/` folder. Copy the entire data folder, not just one SQLite file.
5. Start the new backend and frontend as usual. The backend adds notification tables without deleting users, books, cover uploads or orders. Existing orders initially appear as unread notifications.
6. Open http://localhost:5173 and use Ctrl+F5 once to load the updated code.

For a fresh demonstration, skip step 4. The ZIP contains no database and creates fresh seeded demo accounts and books at startup. Do not delete your old data unless you intend to reset it.

## The five new features
### 1. Admin notifications
The header bell shows an unread count. New orders and cancellations produce saved events. While the admin is signed in with the tab visible, BookVerse checks every 10 seconds and displays a toast for new events. Click the bell to view customer names, order IDs, totals and event times. Click View order to mark that event read and scroll to its order. Mark displayed notifications as read handles up to 50 events at a time; older unread items appear after those are cleared. Each admin account has separate persisted read state.

These are in-app notifications, not email, operating-system push notifications or sounds. The backend and page must be running. Browser throttling/network delays may delay checks. Returning to the tab triggers a check immediately.

### 2. Customer order updates
My orders updates automatically when the admin changes status. The customer also gets an in-app toast if an already-observed order changes while signed in elsewhere in the app. A manual Refresh now button is available. Open dialogs are preserved; the next check refreshes the page after the dialog closes. Offline failures retain the existing page and show a retry message.

### 3. Downloadable invoices
Customer order cards and the admin order desk contain Download invoice. It downloads a self-contained HTML invoice with the customer details, order ID, order date, purchased titles, quantities, original unit prices and total. Open the downloaded file and use Ctrl+P → Save as PDF for a PDF copy.

Invoices use stored order-item snapshots. Editing a book's current price does not rewrite an earlier invoice. Customers can download only their own orders; admins can access all orders. Cancelled orders remain available with a clear cancelled/no-amount-due label. These are academic order records, not tax invoices or receipts proving payment.

### 4. Admin analytics
The dashboard shows total orders (including cancelled), pending fulfilment (Placed/Packed/Shipped), delivered order value, cancelled order count, a 7-day orders chart, status counts and low-stock books. The chart counts every created order, including ones later cancelled, using India calendar dates. Delivered value excludes pending and cancelled orders and is NOT claimed as collected revenue. Low stock means 5 copies or fewer among active books. Restock opens the existing book editor.

### 5. Cancellation before packing
A customer can cancel their own order only while it is Placed. They must confirm in a dialog. The backend checks current status, restores each quantity, changes the status to Cancelled and records a notification in one transaction. Repeating the same request does not restore stock twice. If packing wins a simultaneous request, cancellation is rejected; if cancellation wins, the admin cannot pack it. A cancelled order cannot resume and cannot advance to Shipped or Delivered.

## Demonstrate it to your teacher
1. Sign in as admin in a normal browser window.
2. Open an Incognito window and sign in as the customer.
3. Customer: add books, enter an address and place a COD demo order.
4. Switch to the admin window: returning to the tab triggers a check; otherwise allow about 10 seconds. Show the bell count, popup, order desk and analytics.
5. Open the bell, choose View order, and show that the read count decreases.
6. Mark the order Packed; return to the customer's My orders. Show the automatic status change and the absence of the cancellation button.
7. Download the invoice and use Print → Save as PDF.
8. Place a second order and cancel it before the admin packs it. Show the cancellation notification and restored stock.
9. Complete the first order through Shipped and Delivered. Show that delivered order value increases.

## How to explain the code
- Frontend: fetch calls, a 10-second timer, visible-tab checks, rendered state comparison, native dialog confirmation and Blob download.
- Backend: authenticated REST endpoints, role/ownership checks, prepared SQL statements and transactions.
- Database: `order_events` records order placement/cancellation; `notification_reads` stores the (admin user, event) read relation.
- Cancellation: transaction + status validation gives atomic updates and idempotent retry behavior.
- Invoice: pure server-side template built from order snapshots with HTML escaping.
- Analytics: SQL aggregates and a zero-filled seven-day series, rendered as CSS bars with accessible labels.

## Run commands (unchanged)
Backend terminal, starting from project_10:
```powershell
cd backend
npm.cmd start
```
Frontend terminal, starting from project_10:
```powershell
cd frontend
npm.cmd start
```
Node.js 24+ is required. No package installation is needed to RUN the app.
