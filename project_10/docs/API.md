# BookVerse API and database
Base URL: `http://localhost:8080/api`. JSON requests/responses.
Protected routes require `Authorization: Bearer <token>` returned by login or registration.
Errors use `{ "error": "Readable message" }` with the appropriate HTTP status.

| Method | Route | Access | Payload / purpose |
| --- | --- | --- | --- |
| GET | /health | Public | Runtime and student identity |
| GET | /books | Public | Active book catalog |
| POST | /auth/register | Public | name, email, password; returns token and customer |
| POST | /auth/login | Public | email, password, loginType (CUSTOMER or ADMIN); returns token and user |
| GET | /auth/me | Signed in | Current profile |
| POST | /auth/logout | Token | Invalidate session |
| GET | /cart | Signed in | Current user's bag |
| PUT | /cart | Signed in | bookId, quantity; zero removes |
| GET | /wishlist | Signed in | Saved book IDs |
| PUT | /wishlist | Signed in | bookId, saved (boolean) |
| GET | /orders | Signed in | Own order history and snapshots |
| POST | /orders | Signed in | address; total calculated on server |
| GET | /admin/orders | Admin | All customer orders and items |
| PUT | /admin/orders | Admin | id, status; next stage only |
| POST | /admin/books | Admin | title, author, category, price, stock, mood, description, color, optional cover |
| PUT | /admin/books | Admin | Same fields plus id |
| DELETE | /admin/books?id=ID | Admin | Soft-delete a book; clean bags and wishlists |

## Entity relationships
- users → sessions: one-to-many, tokens expire after 24 hours.
- users → cart ← books: quantity keyed by (user_id, book_id).
- users → wishlist ← books: saved IDs keyed by (user_id, book_id).
- users → orders → order_items: customer history; immutable title/price snapshots.
- books: title, author, category, integer rupee price, stock, mood, description, colour, active flag.
- Foreign keys and prepared statements protect relational integrity and SQL inputs.

## Checkout transaction
1. Authenticate customer and validate address.
2. Begin an immediate SQLite transaction.
3. Load bag and current book stock/prices from the database.
4. Reject an empty bag, inactive book or insufficient stock.
5. Calculate total; insert order and item snapshots.
6. Decrement stock; clear that customer's bag; commit.
7. Roll back all changes on any failure.

Cart stock is checked again at checkout. Adding a book to a bag does not reserve inventory. Monetary values and role information supplied by the browser are never trusted for checkout or access control.

## Example in PowerShell
```powershell
$body = @{ email='rittik@bookverse.local'; password='Reader@123' } | ConvertTo-Json
$session = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
$headers = @{ Authorization = "Bearer $($session.token)" }
Invoke-RestMethod -Uri 'http://localhost:8080/api/cart' -Headers $headers
```

## Order workflow endpoints (28 October 2026)
| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | /orders/:id/cancel | Owner | Cancel only if Placed; idempotent if already cancelled |
| GET | /orders/:id/invoice | Owner or Admin | JSON containing filename and escaped self-contained HTML |
| GET | /admin/notifications | Admin | Up to 50 events, unread first; total unreadCount |
| PUT | /admin/notifications/read | Admin | `{ "ids": [1, 2] }`; mark these events read for this admin |
| GET | /admin/analytics | Admin | Counts, delivered value, low-stock list and seven-day series |

`Cancelled` is a terminal order status. No admin stage transitions are allowed from it. Notification events are inserted within order/cancellation transactions. Read records use a composite primary key (user_id, event_id). Existing orders are backfilled once with unique event keys. GET /orders continues to return current status and is polled by the customer UI. Cancellation of someone else's order returns 404, as does unauthorized invoice access.
