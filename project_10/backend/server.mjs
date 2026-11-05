// BookVerse | Rittik Basak | 24BAI70021
// Built-in Node HTTP + SQLite: no npm dependencies or cloud database required.
import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { books } from "./seed.mjs";
import { invoiceHtml, getAnalytics } from "./order-features.mjs";
const dir = fileURLToPath(new URL("./data/", import.meta.url));
mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(
  process.env.BOOKVERSE_DB || dir + "bookverse.sqlite",
);
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'CUSTOMER');
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id),expires INTEGER);
CREATE TABLE IF NOT EXISTS books(id INTEGER PRIMARY KEY,title TEXT,author TEXT,category TEXT,price INTEGER,stock INTEGER,mood TEXT,description TEXT,color TEXT,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS cart(user_id INTEGER REFERENCES users(id),book_id INTEGER REFERENCES books(id),quantity INTEGER,PRIMARY KEY(user_id,book_id));
CREATE TABLE IF NOT EXISTS wishlist(user_id INTEGER REFERENCES users(id),book_id INTEGER REFERENCES books(id),PRIMARY KEY(user_id,book_id));
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id),total INTEGER,status TEXT,address TEXT,created TEXT);
CREATE TABLE IF NOT EXISTS order_items(order_id INTEGER REFERENCES orders(id),book_id INTEGER,title TEXT,price INTEGER,quantity INTEGER);`);
if (
  !db
    .prepare("PRAGMA table_info(books)")
    .all()
    .some((c) => c.name === "cover")
)
  db.exec("ALTER TABLE books ADD COLUMN cover TEXT DEFAULT ''");
// Additive migration: existing orders, accounts and stock are preserved.
db.exec(`CREATE TABLE IF NOT EXISTS order_events(
 id INTEGER PRIMARY KEY,order_id INTEGER REFERENCES orders(id),kind TEXT,created TEXT,
 UNIQUE(order_id,kind));
 CREATE TABLE IF NOT EXISTS notification_reads(
 user_id INTEGER REFERENCES users(id),event_id INTEGER REFERENCES order_events(id),
 PRIMARY KEY(user_id,event_id));
 INSERT OR IGNORE INTO order_events(order_id,kind,created) SELECT id,'Placed',created FROM orders;
 INSERT OR IGNORE INTO order_events(order_id,kind,created) SELECT id,'Cancelled',created FROM orders WHERE status='Cancelled';`);
const recordEvent = (orderId, kind) =>
  db
    .prepare("INSERT INTO order_events(order_id,kind,created) VALUES(?,?,?)")
    .run(orderId, kind, new Date().toISOString());
const hash = (p) => {
  let salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(p, salt, 64).toString("hex");
};
const matches = (p, h) => {
  const [s, v] = h.split(":");
  return timingSafeEqual(Buffer.from(v, "hex"), scryptSync(p, s, 64));
};
if (!db.prepare("SELECT id FROM users LIMIT 1").get()) {
  const insert = db.prepare(
    "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
  );
  insert.run(
    "Rittik Basak",
    "rittik@bookverse.local",
    hash("Reader@123"),
    "CUSTOMER",
  );
  insert.run(
    "BookVerse Admin",
    "admin@bookverse.local",
    hash("Admin@123"),
    "ADMIN",
  );
}
if (!db.prepare("SELECT id FROM books LIMIT 1").get())
  for (const b of books)
    db.prepare(
      "INSERT INTO books(title,author,category,price,stock,mood,description,color) VALUES(?,?,?,?,?,?,?,?)",
    ).run(...b);
for (let i = 1; i <= 12; i++)
  db.prepare("UPDATE books SET cover=? WHERE id=? AND cover=''").run(
    "/assets/book-" + i + ".jpg",
    i,
  );
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const txt = (x, min = 1, max = 200) => {
  if (typeof x !== "string" || x.trim().length < min || x.trim().length > max)
    fail(400, `Enter text between ${min} and ${max} characters.`);
  return x.trim();
};
const int = (x, min, max) => {
  if (!Number.isInteger(x) || x < min || x > max)
    fail(400, `Enter a whole number between ${min} and ${max}.`);
  return x;
};
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const attempts = new Map();
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (
    origin &&
    !["http://localhost:5173", "http://127.0.0.1:5173"].includes(origin)
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  res.setHeader(
    "Access-Control-Allow-Origin",
    origin || "http://localhost:5173",
  );
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const send = (data, status = 200) => {
    res.writeHead(status);
    res.end(JSON.stringify(data));
  };
  try {
    const path = new URL(req.url, "http://localhost").pathname,
      method = req.method;
    let data = {};
    if (["POST", "PUT"].includes(method)) {
      let body = "";
      for await (const c of req) {
        body += c;
        if (body.length > 1600000) fail(413, "Request too large.");
      }
      try {
        data = JSON.parse(body || "{}");
      } catch {
        fail(400, "Invalid JSON.");
      }
      if (!data || Array.isArray(data) || typeof data !== "object")
        fail(400, "JSON object required.");
    }
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    const user = db
      .prepare(
        "SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?",
      )
      .get(token, Date.now());
    const auth = () => {
      if (!user) fail(401, "Please sign in to continue.");
      return user;
    };
    const admin = () => {
      auth();
      if (user.role !== "ADMIN") fail(403, "Admin access required.");
    };
    if (path === "/api/health" && method === "GET")
      return send({
        status: "ok",
        project: "BookVerse",
        student: "Rittik Basak",
        uid: "24BAI70021",
      });
    if (
      ["/api/auth/login", "/api/auth/register"].includes(path) &&
      method === "POST"
    ) {
      const key = req.socket.remoteAddress;
      let a = attempts.get(key);
      if (!a || Date.now() - a.time > 60000) {
        a = { count: 0, time: Date.now() };
        attempts.set(key, a);
      }
      if (++a.count > 20)
        fail(429, "Too many attempts. Try again in a minute.");
      if (
        data.loginType !== undefined &&
        !["ADMIN", "CUSTOMER"].includes(data.loginType)
      )
        fail(400, "Choose Customer or Admin login.");
      if (path.endsWith("register") && data.loginType === "ADMIN")
        fail(403, "Public admin registration is disabled.");
      const email = txt(data.email, 5, 120).toLowerCase(),
        password = txt(data.password, 8, 128);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        fail(400, "Enter a valid email address.");
      let u;
      if (path.endsWith("register")) {
        if (db.prepare("SELECT id FROM users WHERE email=?").get(email))
          fail(409, "This email already has an account.");
        const r = db
          .prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)")
          .run(txt(data.name, 2, 60), email, hash(password));
        u = db.prepare("SELECT * FROM users WHERE id=?").get(r.lastInsertRowid);
      } else {
        u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
        if (!u || !matches(password, u.password))
          fail(401, "Email or password is incorrect.");
      }
      if (data.loginType && data.loginType !== u.role)
        fail(
          403,
          "This account is not a " +
            data.loginType.toLowerCase() +
            " account. Choose the correct login type.",
        );
      const t = randomBytes(32).toString("hex");
      db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
      db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
        t,
        u.id,
        Date.now() + 86400000,
      );
      return send({ token: t, user: safe(u) });
    }
    if (path === "/api/auth/me" && method === "GET") return send(safe(auth()));
    if (path === "/api/auth/logout" && method === "POST") {
      db.prepare("DELETE FROM sessions WHERE token=?").run(token);
      return send({ ok: true });
    }
    if (path === "/api/books" && method === "GET")
      return send(
        db.prepare("SELECT * FROM books WHERE active=1 ORDER BY id").all(),
      );
    if (path === "/api/cart" && method === "GET") {
      auth();
      return send(
        db
          .prepare(
            "SELECT b.*,c.quantity FROM cart c JOIN books b ON b.id=c.book_id WHERE c.user_id=?",
          )
          .all(user.id),
      );
    }
    if (path === "/api/cart" && method === "PUT") {
      auth();
      const id = int(data.bookId, 1, 1e9),
        q = int(data.quantity, 0, 99);
      const b = db
        .prepare("SELECT * FROM books WHERE id=? AND active=1")
        .get(id);
      if (!b) fail(404, "Book is no longer available.");
      if (q > b.stock) fail(409, "Not enough copies in stock.");
      if (q === 0)
        db.prepare("DELETE FROM cart WHERE user_id=? AND book_id=?").run(
          user.id,
          id,
        );
      else
        db.prepare(
          "INSERT INTO cart VALUES(?,?,?) ON CONFLICT(user_id,book_id) DO UPDATE SET quantity=excluded.quantity",
        ).run(user.id, id, q);
      return send({ ok: true });
    }
    if (path === "/api/wishlist" && method === "GET") {
      auth();
      return send(
        db
          .prepare("SELECT book_id FROM wishlist WHERE user_id=?")
          .all(user.id)
          .map((x) => x.book_id),
      );
    }
    if (path === "/api/wishlist" && method === "PUT") {
      auth();
      const id = int(data.bookId, 1, 1e9);
      if (!db.prepare("SELECT id FROM books WHERE id=? AND active=1").get(id))
        fail(404, "Book not found.");
      if (data.saved === true)
        db.prepare("INSERT OR IGNORE INTO wishlist VALUES(?,?)").run(
          user.id,
          id,
        );
      else
        db.prepare("DELETE FROM wishlist WHERE user_id=? AND book_id=?").run(
          user.id,
          id,
        );
      return send({ ok: true });
    }
    if (path === "/api/orders" && method === "POST") {
      auth();
      const address = txt(data.address, 10, 500);
      db.exec("BEGIN IMMEDIATE");
      try {
        const rows = db
          .prepare(
            "SELECT b.*,c.quantity FROM cart c JOIN books b ON b.id=c.book_id WHERE c.user_id=?",
          )
          .all(user.id);
        if (!rows.length) fail(400, "Your bag is empty.");
        for (const b of rows)
          if (!b.active || b.stock < b.quantity)
            fail(409, `${b.title} has insufficient stock. Update your bag.`);
        const total = rows.reduce((s, b) => s + b.price * b.quantity, 0);
        const id = Number(
          db
            .prepare(
              "INSERT INTO orders(user_id,total,status,address,created) VALUES(?,?,'Placed',?,?)",
            )
            .run(user.id, total, address, new Date().toISOString())
            .lastInsertRowid,
        );
        for (const b of rows) {
          db.prepare("INSERT INTO order_items VALUES(?,?,?,?,?)").run(
            id,
            b.id,
            b.title,
            b.price,
            b.quantity,
          );
          db.prepare("UPDATE books SET stock=stock-? WHERE id=?").run(
            b.quantity,
            b.id,
          );
        }
        db.prepare("DELETE FROM cart WHERE user_id=?").run(user.id);
        recordEvent(id, "Placed");
        db.exec("COMMIT");
        return send({ id, total }, 201);
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    }
    if (path === "/api/orders" && method === "GET") {
      auth();
      return send(
        db
          .prepare("SELECT * FROM orders WHERE user_id=? ORDER BY id DESC")
          .all(user.id)
          .map((o) => ({
            ...o,
            items: db
              .prepare("SELECT * FROM order_items WHERE order_id=?")
              .all(o.id),
          })),
      );
    }
    const cancelMatch = path.match(/^\/api\/orders\/(\d+)\/cancel$/);
    if (cancelMatch && method === "POST") {
      auth();
      const id = int(Number(cancelMatch[1]), 1, 1e9);
      db.exec("BEGIN IMMEDIATE");
      try {
        const order = db
          .prepare("SELECT * FROM orders WHERE id=? AND user_id=?")
          .get(id, user.id);
        if (!order) fail(404, "Order not found.");
        // Repeating cancellation is safe: stock can be restored only once.
        if (order.status === "Cancelled") {
          db.exec("COMMIT");
          return send({
            ok: true,
            status: "Cancelled",
            alreadyCancelled: true,
          });
        }
        if (order.status !== "Placed")
          fail(
            409,
            "This order has already been packed or dispatched and cannot be cancelled.",
          );
        const items = db
          .prepare("SELECT book_id,quantity FROM order_items WHERE order_id=?")
          .all(id);
        for (const item of items)
          db.prepare("UPDATE books SET stock=stock+? WHERE id=?").run(
            item.quantity,
            item.book_id,
          );
        db.prepare("UPDATE orders SET status='Cancelled' WHERE id=?").run(id);
        recordEvent(id, "Cancelled");
        db.exec("COMMIT");
        return send({ ok: true, status: "Cancelled", alreadyCancelled: false });
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }
    const invoiceMatch = path.match(/^\/api\/orders\/(\d+)\/invoice$/);
    if (invoiceMatch && method === "GET") {
      auth();
      const id = int(Number(invoiceMatch[1]), 1, 1e9);
      const order = db
        .prepare(
          "SELECT o.*,u.name,u.email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?",
        )
        .get(id);
      if (!order || (order.user_id !== user.id && user.role !== "ADMIN"))
        fail(404, "Order not found.");
      const items = db
        .prepare("SELECT * FROM order_items WHERE order_id=?")
        .all(id);
      return send({
        filename:
          "BookVerse-BV-" + String(id).padStart(4, "0") + "-invoice.html",
        html: invoiceHtml(order, items),
      });
    }
    if (path.startsWith("/api/admin/")) {
      admin();
      if (path === "/api/admin/analytics" && method === "GET")
        return send(getAnalytics(db));
      if (path === "/api/admin/notifications" && method === "GET") {
        const items = db
          .prepare(
            `SELECT e.id,e.order_id,e.kind,e.created,o.status,o.total,u.name,
          CASE WHEN r.event_id IS NULL THEN 0 ELSE 1 END AS is_read
          FROM order_events e JOIN orders o ON o.id=e.order_id JOIN users u ON u.id=o.user_id
          LEFT JOIN notification_reads r ON r.event_id=e.id AND r.user_id=?
          ORDER BY is_read ASC,e.id DESC LIMIT 50`,
          )
          .all(user.id);
        const unreadCount = db
          .prepare(
            "SELECT COUNT(*) AS count FROM order_events e WHERE NOT EXISTS(SELECT 1 FROM notification_reads r WHERE r.event_id=e.id AND r.user_id=?)",
          )
          .get(user.id).count;
        return send({ items, unreadCount });
      }
      if (path === "/api/admin/notifications/read" && method === "PUT") {
        if (
          !Array.isArray(data.ids) ||
          data.ids.length < 1 ||
          data.ids.length > 50
        )
          fail(400, "Provide 1 to 50 notification IDs.");
        const ids = [...new Set(data.ids.map((id) => int(id, 1, 1e9)))];
        db.exec("BEGIN IMMEDIATE");
        try {
          for (const id of ids) {
            if (!db.prepare("SELECT id FROM order_events WHERE id=?").get(id))
              fail(404, "Notification not found.");
            db.prepare(
              "INSERT OR IGNORE INTO notification_reads(user_id,event_id) VALUES(?,?)",
            ).run(user.id, id);
          }
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
        return send({ ok: true });
      }
      if (path === "/api/admin/orders" && method === "GET")
        return send(
          db
            .prepare(
              "SELECT o.*,u.name,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC",
            )
            .all()
            .map((o) => ({
              ...o,
              items: db
                .prepare("SELECT * FROM order_items WHERE order_id=?")
                .all(o.id),
            })),
        );
      if (path === "/api/admin/orders" && method === "PUT") {
        const id = int(data.id, 1, 1e9),
          o = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
        if (!o) fail(404, "Order not found.");
        const next = {
          Placed: "Packed",
          Packed: "Shipped",
          Shipped: "Delivered",
        };
        if (!next[o.status] || next[o.status] !== data.status)
          fail(400, "Choose the next delivery stage.");
        db.prepare("UPDATE orders SET status=? WHERE id=?").run(
          data.status,
          id,
        );
        return send({ ok: true });
      }
      if (path === "/api/admin/books" && ["POST", "PUT"].includes(method)) {
        const fields = [
          txt(data.title, 1, 150),
          txt(data.author, 1, 100),
          txt(data.category, 1, 50),
          int(data.price, 1, 100000),
          int(data.stock, 0, 10000),
          txt(data.mood, 1, 30),
          txt(data.description, 10, 1000),
          txt(data.color, 7, 7),
        ];
        if (!/^#[0-9a-f]{6}$/i.test(fields[7]))
          fail(400, "Invalid cover color.");
        const cover =
          data.cover === undefined ? undefined : txt(data.cover, 0, 1500000);
        if (
          cover &&
          !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(cover) &&
          !/^\/assets\/book-\d+\.jpg$/.test(cover)
        )
          fail(400, "Upload a PNG, JPEG or WebP cover image.");
        if (cover?.startsWith("data:")) {
          const bytes = Buffer.from(cover.split(",")[1], "base64");
          if (bytes.length > 1000000)
            fail(400, "Cover must be 1 MB or smaller.");
          const valid =
            bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
            (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
            (bytes.toString("ascii", 0, 4) === "RIFF" &&
              bytes.toString("ascii", 8, 12) === "WEBP");
          if (!valid) fail(400, "Invalid image file.");
        }
        if (method === "POST") {
          const r = db
            .prepare(
              "INSERT INTO books(title,author,category,price,stock,mood,description,color) VALUES(?,?,?,?,?,?,?,?)",
            )
            .run(...fields);
          if (cover)
            db.prepare("UPDATE books SET cover=? WHERE id=?").run(
              cover,
              r.lastInsertRowid,
            );
          return send({ id: Number(r.lastInsertRowid) }, 201);
        }
        const id = int(data.id, 1, 1e9);
        if (!db.prepare("SELECT id FROM books WHERE id=? AND active=1").get(id))
          fail(404, "Book not found.");
        db.prepare(
          "UPDATE books SET title=?,author=?,category=?,price=?,stock=?,mood=?,description=?,color=? WHERE id=?",
        ).run(...fields, id);
        if (cover !== undefined)
          db.prepare("UPDATE books SET cover=? WHERE id=?").run(cover, id);
        return send({ ok: true });
      }
      if (path === "/api/admin/books" && method === "DELETE") {
        const id = Number(
          new URL(req.url, "http://localhost").searchParams.get("id"),
        );
        if (!db.prepare("SELECT id FROM books WHERE id=? AND active=1").get(id))
          fail(404, "Book not found.");
        db.exec("BEGIN");
        try {
          db.prepare("UPDATE books SET active=0 WHERE id=?").run(id);
          db.prepare("DELETE FROM cart WHERE book_id=?").run(id);
          db.prepare("DELETE FROM wishlist WHERE book_id=?").run(id);
          db.exec("COMMIT");
        } catch (e) {
          db.exec("ROLLBACK");
          throw e;
        }
        return send({ ok: true });
      }
    }
    fail(404, "Endpoint not found.");
  } catch (e) {
    if (!e.status) console.error(e);
    send(
      { error: e.status ? e.message : "Unexpected server error." },
      e.status || 500,
    );
  }
});
server.listen(Number(process.env.PORT || 8080), "127.0.0.1", () =>
  console.log("BookVerse API: http://localhost:" + (process.env.PORT || 8080)),
);
