# Demonstration and viva guide
Rittik Basak · 24BAI70021 · BookVerse · Experiment 10

## A seven-minute demonstration
1. Start both servers. Show the BookVerse name and your identity in the footer.
2. Search “Sherlock”; filter Mystery; switch the Solve mood. Clear filters and sort low-to-high.
3. Open a book title to view its details. Use the surprise-reading button.
4. Sign in as the customer. Save two books with the heart button. Open My bookshelf.
5. Add a book to the bag. Increase/decrease quantity. Enter a complete address. Place a demo COD order.
6. Show the order total and Placed stage. Reload the page and show that data persists.
7. Sign out, sign in as admin and open Admin dashboard. Add a title, edit its stock/price, then remove that test title.
8. Advance the customer's order through Packed and Shipped. Sign back in as the customer to show updated tracking.
9. Run `npm.cmd test` in the backend folder and explain the passing checks.

## How to explain the architecture
The frontend is the presentation layer: semantic HTML, responsive CSS and modular browser JavaScript. It sends HTTP requests with fetch. The Node HTTP backend is the business layer: it authenticates requests, checks roles and validates data. SQLite is the persistence layer. The frontend runs on port 5173 and the backend on 8080; CORS permits only the local frontend origins.

## Common viva questions
**Why separate folders?** Frontend and backend have separate responsibilities, start commands and code. Neither needs to contain the other's implementation.

**What makes this full stack?** The browser calls a real API; users, stock, saved books, carts and orders are stored in SQLite and survive restarts.

**Why SQLite?** It is a relational database that runs without an external database service, making local evaluation straightforward. SQLite transactions support atomic checkout.

**Is this JWT?** No. It uses cryptographically random opaque bearer tokens stored server-side with expiration. This permits immediate logout revocation. Do not describe it as JWT authentication.

**How are passwords stored?** Each uses a random salt and scrypt password hashing. The original password is not stored. Login compares hashes with a timing-safe comparison.

**Can a customer become admin by editing frontend code?** No. The backend checks the persisted user role on every admin route. Registration always creates a CUSTOMER.

**Why calculate price in the backend?** A user can modify browser requests. The backend reads prices from the database and ignores client totals.

**What is a transaction?** A group of database operations that all succeed or all roll back. Order creation, stock reduction and cart clearing form one transaction.

**What happens if two customers buy the last copy?** Checkout obtains an immediate transaction lock and rechecks stock. One succeeds; the other receives a stock error without a partial order.

**What is soft deletion?** A book's active flag becomes zero. It disappears from sale, while historical order snapshots remain valid.

**Which features are distinctive?** Light/dark themes, personal reading welcome popup, uploaded cover images, budget and reading mood filters, saved bookshelf, surprise discovery and the admin studio with low-stock indicators.

**Is the payment real?** No. COD checkout is an academic order demonstration. There is no money transfer or courier integration.

**What would you add for production?** HTTPS, production account provisioning, secure deployment configuration, database migrations, password recovery, monitoring and real payment/shipping services if needed.

## Mapping to the assignment
| Required feature | Implementation |
| --- | --- |
| Assigned project name | BookVerse in header, title and footer |
| Own name and UID | Rittik Basak / 24BAI70021 in footer and health API |
| Catalog | Seeded books and detail dialog |
| Search and filtering | Title/author search, genre and mood filtering |
| Registration/login | Customer registration, password hashes, session tokens |
| Shopping cart | Persistent per-user bag and quantity controls |
| Order management | Transactional checkout, customer history, admin status progression |
| Admin CRUD | Catalog listing, add, edit and soft-delete |
| Frontend-backend connectivity | Fetch requests to REST endpoints |

## Explain the login separation
The login form sends loginType=CUSTOMER or ADMIN. The backend checks that the authenticated account has that stored role before issuing a session. Every admin API call independently verifies the stored role; changing the browser UI cannot grant permissions. Public registration creates only CUSTOMER accounts.

## Explain the theme and welcome popup
The theme button changes data-theme on the root HTML element. CSS custom properties supply dark/light colours. localStorage stores only the chosen theme. After successful customer authentication, a native dialog displays the reader’s first name and a caption; the admin is sent to the dashboard instead.

## Explain cover uploads
The admin chooses a local image. The browser FileReader converts it to a data URL, validates type/size and sends it with the book fields. The backend validates the accepted format and stores it in the book row. Seed covers are served from frontend/assets.

## New order workflow demonstration
Follow UPGRADE_AND_NEW_FEATURES.md for the two-window demo and new viva explanations. The app uses periodic HTTP polling, not WebSockets: setInterval schedules checks every 10 seconds, hidden tabs are skipped, and returning to the tab checks immediately. Do not describe this as instant push delivery. Invoices download as HTML and can be printed to PDF. Delivered value is a demo order total, not actual collected payment.
