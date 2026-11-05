// Integration tests use a temporary SQLite DB; your application data is untouched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
test("BookVerse: authentication, authorization, cart, atomic orders and admin CRUD", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bookverse-test-"));
  const proc = spawn(process.execPath, ["server.mjs"], {
    cwd: new URL(".", import.meta.url),
    env: {
      ...process.env,
      PORT: "18080",
      BOOKVERSE_DB: join(dir, "test.sqlite"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  proc.stderr.on("data", (c) => (output += c));
  const call = async (path, method = "GET", body, token) => {
    const r = await fetch("http://127.0.0.1:18080/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    await Promise.race([
      once(proc.stdout, "data"),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Error("Startup timeout " + output)),
          8000,
        ).unref(),
      ),
    ]);
    assert.equal((await call("/health")).data.status, "ok");
    const catalog = (await call("/books")).data;
    assert.equal(catalog.length, 12);
    assert.equal((await call("/cart")).status, 401);
    const login = await call("/auth/login", "POST", {
      email: "rittik@bookverse.local",
      password: "Reader@123",
    });
    assert.equal(login.status, 200);
    const t = login.data.token;
    const a = (
      await call("/auth/login", "POST", {
        email: "admin@bookverse.local",
        password: "Admin@123",
      })
    ).data.token;
    assert.ok(a);
    assert.equal(
      (
        await call("/auth/login", "POST", {
          email: "rittik@bookverse.local",
          password: "Reader@123",
          loginType: "ADMIN",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await call("/auth/login", "POST", {
          email: "admin@bookverse.local",
          password: "Admin@123",
          loginType: "CUSTOMER",
        })
      ).status,
      403,
    );
    assert.ok(catalog[0].cover.startsWith("/assets/"));
    assert.equal((await call("/admin/orders", "GET", null, t)).status, 403);
    const fresh = await call("/auth/register", "POST", {
      name: "Test Reader",
      email: "test@example.com",
      password: "Test@123",
      role: "ADMIN",
    });
    assert.equal(fresh.status, 200);
    assert.equal(fresh.data.user.role, "CUSTOMER");
    assert.equal(
      (
        await call("/auth/register", "POST", {
          name: "Duplicate",
          email: "test@example.com",
          password: "Test@123",
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await call("/auth/login", "POST", {
          email: "test@example.com",
          password: "wrong@123",
        })
      ).status,
      401,
    );
    assert.equal(
      (await call("/cart", "PUT", { bookId: 1, quantity: -1 }, t)).status,
      400,
    );
    assert.equal(
      (await call("/cart", "PUT", { bookId: 1, quantity: 99 }, t)).status,
      409,
    );
    assert.equal(
      (await call("/cart", "PUT", { bookId: 1, quantity: 2 }, t)).status,
      200,
    );
    assert.equal((await call("/cart", "GET", null, t)).data[0].quantity, 2);
    await call("/wishlist", "PUT", { bookId: 1, saved: true }, t);
    assert.deepEqual((await call("/wishlist", "GET", null, t)).data, [1]);
    assert.equal(
      (await call("/orders", "POST", { address: "short" }, t)).status,
      400,
    );
    const o = await call(
      "/orders",
      "POST",
      { address: "123 College Road, Delhi 110001", total: 1 },
      t,
    );
    assert.equal(o.status, 201);
    assert.equal(o.data.total, 598);
    assert.equal((await call("/books")).data[0].stock, 16);
    assert.equal((await call("/cart", "GET", null, t)).data.length, 0);
    assert.equal(
      (
        await call(
          "/orders",
          "POST",
          { address: "123 College Road, Delhi 110001" },
          t,
        )
      ).status,
      400,
    );
    assert.equal(
      (await call("/orders", "GET", null, fresh.data.token)).data.length,
      0,
    );
    assert.equal(
      (await call("/orders", "GET", null, t)).data[0].items[0].quantity,
      2,
    );
    assert.equal(
      (
        await call(
          "/admin/orders",
          "PUT",
          { id: o.data.id, status: "Delivered" },
          a,
        )
      ).status,
      400,
    );
    for (const status of ["Packed", "Shipped", "Delivered"])
      assert.equal(
        (await call("/admin/orders", "PUT", { id: o.data.id, status }, a))
          .status,
        200,
      );
    const book = {
      title: "Test Story",
      author: "Test Author",
      category: "Fantasy",
      price: 100,
      stock: 1,
      mood: "Escape",
      description: "A test-only story description.",
      color: "#123456",
    };
    assert.equal((await call("/admin/books", "POST", book, t)).status, 403);
    const id = (await call("/admin/books", "POST", book, a)).data.id;
    assert.ok(id);
    assert.equal(
      (
        await call(
          "/admin/books",
          "PUT",
          { ...book, id, cover: "javascript:alert(1)" },
          a,
        )
      ).status,
      400,
    );
    const image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5S8AAAAASUVORK5CYII=";
    assert.equal(
      (await call("/admin/books", "PUT", { ...book, id, cover: image }, a))
        .status,
      200,
    );
    assert.equal(
      (await call("/books")).data.find((b) => b.id === id).cover,
      image,
    );
    await call("/cart", "PUT", { bookId: id, quantity: 1 }, t);
    await call("/cart", "PUT", { bookId: id, quantity: 1 }, fresh.data.token);
    const race = await Promise.all([
      call("/orders", "POST", { address: "123 College Road, Delhi 110001" }, t),
      call(
        "/orders",
        "POST",
        { address: "456 College Road, Delhi 110001" },
        fresh.data.token,
      ),
    ]);
    assert.deepEqual(race.map((r) => r.status).sort(), [201, 409]);
    assert.equal(
      (
        await call(
          "/admin/books",
          "PUT",
          { ...book, id, title: "Updated Story", stock: 5 },
          a,
        )
      ).status,
      200,
    );
    assert.equal(
      (await call("/admin/books?id=" + id, "DELETE", null, a)).status,
      200,
    );
    assert.ok(!(await call("/books")).data.some((b) => b.id === id));
    await call("/auth/logout", "POST", {}, t);
    assert.equal((await call("/auth/me", "GET", null, t)).status, 401);
    const cors = await fetch("http://127.0.0.1:18080/api/books", {
      headers: { Origin: "http://untrusted.example" },
    });
    assert.equal(cors.status, 403);
    console.log(
      "PASS: seeded catalog; login/register; duplicate rejection; role safety; validation; wishlist; totals; checkout; stock race; order isolation; status transitions; CRUD; logout; origin protection.",
    );
  } finally {
    if (proc.exitCode === null) {
      proc.kill();
      await once(proc, "exit");
    }
    rmSync(dir, { recursive: true, force: true });
  }
});
