import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";

test("Order lifecycle: notifications, invoices, cancellation, analytics and persistence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bookverse-orders-"));
  const dbPath = join(dir, "orders.sqlite");
  let processHandle;
  async function start() {
    processHandle = spawn(process.execPath, ["server.mjs"], {
      cwd: new URL(".", import.meta.url),
      env: { ...process.env, PORT: "18081", BOOKVERSE_DB: dbPath },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let err = "";
    processHandle.stderr.on("data", (c) => (err += c));
    await Promise.race([
      once(processHandle.stdout, "data"),
      new Promise((_, reject) =>
        setTimeout(() => reject(Error("Startup failed: " + err)), 8000).unref(),
      ),
    ]);
  }
  async function stop() {
    if (processHandle?.exitCode === null) {
      processHandle.kill();
      await once(processHandle, "exit");
    }
  }
  async function call(path, method = "GET", body, token) {
    const r = await fetch("http://127.0.0.1:18081/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: await r.json() };
  }
  const address = "123 Demonstration Street, Kolkata 700001";
  try {
    await start();
    const admin = (
      await call("/auth/login", "POST", {
        email: "admin@bookverse.local",
        password: "Admin@123",
        loginType: "ADMIN",
      })
    ).data.token;
    const reader = (
      await call("/auth/login", "POST", {
        email: "rittik@bookverse.local",
        password: "Reader@123",
        loginType: "CUSTOMER",
      })
    ).data.token;
    const other = (
      await call("/auth/register", "POST", {
        name: "Other Reader",
        email: "other@example.com",
        password: "Reader@456",
        loginType: "CUSTOMER",
      })
    ).data.token;
    assert.equal(
      (await call("/admin/analytics", "GET", undefined, reader)).status,
      403,
    );
    assert.equal((await call("/admin/notifications")).status, 401);
    assert.equal(
      (await call("/admin/notifications/read", "PUT", { ids: [1] }, reader))
        .status,
      403,
    );
    const zero = (await call("/admin/analytics", "GET", undefined, admin)).data;
    assert.equal(zero.totalOrders, 0);
    assert.equal(zero.pendingOrders, 0);
    assert.equal(zero.deliveredValue, 0);
    assert.equal(zero.days.length, 7);
    assert.ok(zero.days.every((d) => d.count === 0));
    assert.equal(
      (await call("/admin/notifications", "GET", undefined, admin)).data
        .unreadCount,
      0,
    );
    const original = (await call("/books")).data[0];
    await call(
      "/admin/books",
      "PUT",
      { ...original, title: "A <script>alert(1)</script> Story" },
      admin,
    );
    await call("/cart", "PUT", { bookId: 1, quantity: 2 }, reader);
    const first = (await call("/orders", "POST", { address }, reader)).data;
    let n = (await call("/admin/notifications", "GET", undefined, admin)).data;
    assert.equal(n.unreadCount, 1);
    assert.equal(n.items[0].order_id, first.id);
    assert.equal(n.items[0].kind, "Placed");
    assert.equal((await call("/orders/" + first.id + "/invoice")).status, 401);
    assert.equal(
      (await call("/orders/" + first.id + "/invoice", "GET", undefined, other))
        .status,
      404,
    );
    const invoice = (
      await call("/orders/" + first.id + "/invoice", "GET", undefined, reader)
    ).data;
    assert.match(invoice.filename, /invoice\.html$/);
    assert.match(invoice.html, /₹598/);
    assert.ok(invoice.html.includes("&lt;script&gt;"));
    assert.ok(!invoice.html.includes("<script>"));
    await call(
      "/admin/books",
      "PUT",
      { ...original, price: 9999, stock: 16 },
      admin,
    );
    assert.match(
      (await call("/orders/" + first.id + "/invoice", "GET", undefined, admin))
        .data.html,
      /₹598/,
    );
    assert.equal(
      (await call("/orders/" + first.id + "/cancel", "POST", {}, other)).status,
      404,
    );
    const cancels = await Promise.all([
      call("/orders/" + first.id + "/cancel", "POST", {}, reader),
      call("/orders/" + first.id + "/cancel", "POST", {}, reader),
    ]);
    assert.ok(cancels.every((c) => c.status === 200));
    assert.equal(cancels.filter((c) => !c.data.alreadyCancelled).length, 1);
    assert.equal((await call("/books")).data[0].stock, 18);
    assert.equal(
      (
        await call(
          "/admin/orders",
          "PUT",
          { id: first.id, status: "Packed" },
          admin,
        )
      ).status,
      400,
    );
    assert.equal(
      (await call("/admin/orders", "PUT", { id: first.id }, admin)).status,
      400,
    );
    assert.match(
      (await call("/orders/" + first.id + "/invoice", "GET", undefined, reader))
        .data.html,
      /CANCELLED/,
    );
    n = (await call("/admin/notifications", "GET", undefined, admin)).data;
    assert.equal(n.unreadCount, 2);
    assert.equal(n.items.filter((i) => i.kind === "Cancelled").length, 1);
    // A second admin is a test fixture; account roles still cannot be set by public registration.
    const fixture = new DatabaseSync(dbPath);
    fixture
      .prepare(
        "INSERT INTO users(name,email,password,role) SELECT 'Admin Two','admin2@bookverse.local',password,'ADMIN' FROM users WHERE email='admin@bookverse.local'",
      )
      .run();
    fixture.close();
    const admin2 = (
      await call("/auth/login", "POST", {
        email: "admin2@bookverse.local",
        password: "Admin@123",
        loginType: "ADMIN",
      })
    ).data.token;
    assert.equal(
      (
        await call(
          "/admin/notifications/read",
          "PUT",
          { ids: n.items.map((i) => i.id) },
          admin,
        )
      ).status,
      200,
    );
    assert.equal(
      (await call("/admin/notifications", "GET", undefined, admin)).data
        .unreadCount,
      0,
    );
    assert.equal(
      (await call("/admin/notifications", "GET", undefined, admin2)).data
        .unreadCount,
      2,
    );
    assert.equal(
      (await call("/admin/notifications/read", "PUT", { ids: [] }, admin))
        .status,
      400,
    );
    await call("/cart", "PUT", { bookId: 2, quantity: 1 }, other);
    const second = (await call("/orders", "POST", { address }, other)).data;
    for (const status of ["Packed", "Shipped", "Delivered"])
      assert.equal(
        (await call("/admin/orders", "PUT", { id: second.id, status }, admin))
          .status,
        200,
      );
    assert.equal(
      (await call("/orders/" + second.id + "/cancel", "POST", {}, other))
        .status,
      409,
    );
    assert.equal(
      (await call("/orders", "GET", undefined, other)).data[0].status,
      "Delivered",
    );
    await call("/cart", "PUT", { bookId: 3, quantity: 1 }, reader);
    const third = (await call("/orders", "POST", { address }, reader)).data;
    await call(
      "/admin/orders",
      "PUT",
      { id: third.id, status: "Packed" },
      admin,
    );
    assert.equal(
      (await call("/orders/" + third.id + "/cancel", "POST", {}, reader))
        .status,
      409,
    );
    const analytics = (await call("/admin/analytics", "GET", undefined, admin))
      .data;
    assert.equal(analytics.totalOrders, 3);
    assert.equal(analytics.pendingOrders, 1);
    assert.equal(analytics.cancelledOrders, 1);
    assert.equal(analytics.deliveredValue, 349);
    assert.equal(
      analytics.days.reduce((a, b) => a + b.count, 0),
      3,
    );
    // Cancellation after catalog removal restores stock without relisting the book.
    await call("/cart", "PUT", { bookId: 4, quantity: 1 }, reader);
    const fourth = (await call("/orders", "POST", { address }, reader)).data;
    await call("/admin/books?id=4", "DELETE", undefined, admin);
    assert.equal(
      (await call("/orders/" + fourth.id + "/cancel", "POST", {}, reader))
        .status,
      200,
    );
    assert.ok(!(await call("/books")).data.some((b) => b.id === 4));
    const check = new DatabaseSync(dbPath);
    assert.equal(
      check.prepare("SELECT stock FROM books WHERE id=4").get().stock,
      15,
    );
    check.close();
    // A concurrently packed order either cancels once or remains packed, never both.
    await call("/cart", "PUT", { bookId: 5, quantity: 1 }, reader);
    const fifth = (await call("/orders", "POST", { address }, reader)).data;
    const race = await Promise.all([
      call("/orders/" + fifth.id + "/cancel", "POST", {}, reader),
      call("/admin/orders", "PUT", { id: fifth.id, status: "Packed" }, admin),
    ]);
    const order = (await call("/orders", "GET", undefined, reader)).data.find(
      (o) => o.id === fifth.id,
    );
    assert.ok(["Cancelled", "Packed"].includes(order.status));
    assert.equal(race.filter((r) => r.status === 200).length, 1);
    assert.equal(
      (await call("/books")).data.find((b) => b.id === 5).stock,
      order.status === "Cancelled" ? 10 : 9,
    );
    const before = (await call("/admin/notifications", "GET", undefined, admin))
      .data;
    await stop();
    await start();
    const after = (await call("/admin/notifications", "GET", undefined, admin))
      .data;
    assert.equal(after.unreadCount, before.unreadCount);
    assert.equal(after.items.length, before.items.length);
    assert.equal(
      (await call("/orders", "GET", undefined, reader)).data.find(
        (o) => o.id === first.id,
      ).status,
      "Cancelled",
    );
    console.log(
      "PASS: order events; persisted per-admin read state; authorization; escaped snapshot invoices; idempotent cancellation; packing race; stock restoration; seven-day analytics; restart migration.",
    );
  } finally {
    await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
