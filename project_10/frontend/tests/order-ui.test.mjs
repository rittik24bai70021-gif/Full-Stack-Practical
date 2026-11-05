// Optional DOM unit tests. Install jsdom separately as documented in frontend/README.md.
// This uses a simulated DOM and mocked HTTP responses; it is not a browser E2E test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { JSDOM } = require(process.env.BOOKVERSE_TEST_JSDOM || "jsdom");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const flush = async () => {
  for (let i = 0; i < 20; i++)
    await new Promise((resolve) => setImmediate(resolve));
};
function setup(role) {
  const dom = new JSDOM(html, {
    url: "http://localhost:5173/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  const state = {
    role,
    status: "Placed",
    events: [],
    reads: [],
    fail: false,
    download: false,
    requests: [],
    resolveSlow: null,
  };
  const b = {
    id: 1,
    title: "A Test Book",
    author: "Test Author",
    category: "Classics",
    price: 299,
    stock: 5,
    mood: "Escape",
    description: "A test description",
    color: "#123456",
    cover: "",
  };
  const order = () => ({
    id: 1,
    user_id: 1,
    name: "Demo Reader",
    email: "demo@example.com",
    address: "123 Test Street",
    created: "2026-10-28T10:00:00Z",
    status: state.status,
    total: 299,
    items: [{ title: b.title, quantity: 1, price: 299 }],
  });
  w.sessionStorage.setItem("bookverseToken", "test-session");
  w.setTimeout = () => 0;
  w.clearTimeout = () => {};
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.URL.createObjectURL = () => "blob:test";
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {
    state.download = this.download;
  };
  w.setInterval = (callback, ms) => {
    assert.equal(ms, 10000);
    state.tick = callback;
    return 1;
  };
  w.fetch = async (url, options = {}) => {
    const path = url.replace("http://localhost:8080/api", "");
    state.requests.push(path);
    if (state.fail) throw Error("Offline");
    const data = options.body ? JSON.parse(options.body) : {};
    let result;
    if (path === "/auth/me")
      result = {
        id: role === "ADMIN" ? 2 : 1,
        name: "Demo Reader",
        email: "demo@example.com",
        role,
      };
    else if (path === "/books") result = [b];
    else if (path === "/cart" || path === "/wishlist") result = [];
    else if (path === "/orders" || path === "/admin/orders") result = [order()];
    else if (path === "/admin/analytics")
      result = {
        totalOrders: 1,
        pendingOrders: state.status === "Placed" ? 1 : 0,
        deliveredValue: state.status === "Delivered" ? 299 : 0,
        cancelledOrders: state.status === "Cancelled" ? 1 : 0,
        activeTitles: 1,
        lowStock: [b],
        days: Array.from({ length: 7 }, (_, i) => ({
          day: `2026-10-${22 + i}`,
          count: i === 6 ? 1 : 0,
        })),
        statuses: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"].map(
          (s) => ({ status: s, count: s === state.status ? 1 : 0 }),
        ),
      };
    else if (path === "/admin/notifications")
      result = {
        items: state.events.map((e) => ({
          ...e,
          is_read: state.reads.includes(e.id) ? 1 : 0,
        })),
        unreadCount: state.events.filter((e) => !state.reads.includes(e.id))
          .length,
      };
    else if (path === "/admin/notifications/read") {
      state.reads.push(...data.ids);
      result = { ok: true };
    } else if (path === "/orders/1/cancel") {
      state.status = "Cancelled";
      result = { ok: true };
    } else if (path === "/orders/1/invoice")
      result = {
        html: "<!doctype html><title>Invoice</title>",
        filename: "BookVerse-BV-0001-invoice.html",
      };
    else throw Error("Unexpected mocked endpoint: " + path);
    if (state.resolveSlow && path === "/orders") {
      const release = state.resolveSlow;
      state.resolveSlow = null;
      await release.promise;
    }
    return { ok: true, status: 200, json: async () => structuredClone(result) };
  };
  w.eval(
    app +
      "\nwindow.testHooks={navigate,checkOrderUpdates,notifications,cancelOrder,downloadInvoice};",
  );
  return { dom, w, state };
}
test("Customer UI updates automatically, protects open dialogs, cancels and downloads invoice", async () => {
  const { dom, w, state } = setup("CUSTOMER");
  try {
    await flush();
    await w.testHooks.navigate("orders");
    assert.ok(w.document.querySelector('[data-cancel="1"]'));
    state.status = "Packed";
    await w.testHooks.checkOrderUpdates();
    assert.equal(
      w.document.querySelector("#order-1 .status").textContent,
      "Packed",
    );
    assert.equal(w.document.querySelector('[data-cancel="1"]'), null);
    assert.match(w.document.querySelector("#toast").textContent, /now packed/);
    // No paint while a form/dialog is open; next check applies the changed status.
    w.document.querySelector("#dialog").showModal();
    state.status = "Delivered";
    await w.testHooks.checkOrderUpdates();
    assert.equal(
      w.document.querySelector("#order-1 .status").textContent,
      "Packed",
    );
    w.document.querySelector("#dialog").close();
    await flush();
    assert.equal(
      w.document.querySelector("#order-1 .status").textContent,
      "Delivered",
    );
    state.status = "Placed";
    await w.testHooks.checkOrderUpdates();
    w.testHooks.cancelOrder(1);
    w.document.querySelector("#confirmCancellation").click();
    await flush();
    assert.equal(
      w.document.querySelector("#order-1 .status").textContent,
      "Cancelled",
    );
    assert.equal(w.document.querySelector('[data-cancel="1"]'), null);
    assert.match(
      w.document.querySelector(".cancellation-note").textContent,
      /Stock has been restored/,
    );
    await w.testHooks.downloadInvoice(1);
    assert.equal(state.download, "BookVerse-BV-0001-invoice.html");
    state.fail = true;
    await w.testHooks.checkOrderUpdates();
    assert.match(
      w.document.querySelector("#liveText").textContent,
      /Connection interrupted/,
    );
    state.fail = false;
    await w.testHooks.checkOrderUpdates();
    assert.match(w.document.querySelector("#liveText").textContent, /Updated/);
  } finally {
    dom.window.close();
  }
});
test("Admin UI receives notification badge, updates metrics and persists read requests", async () => {
  const { dom, w, state } = setup("ADMIN");
  try {
    await flush();
    await w.testHooks.navigate("admin");
    assert.equal(w.document.querySelectorAll(".bar-column").length, 7);
    assert.equal(
      w.document.querySelectorAll(".expanded-stats .stat").length,
      4,
    );
    state.events.push({
      id: 1,
      order_id: 1,
      kind: "Placed",
      name: "Demo Reader",
      total: 299,
      created: "2026-10-28T10:00:00Z",
    });
    await w.testHooks.checkOrderUpdates();
    assert.equal(
      w.document.querySelector("#notificationCount").textContent,
      "1",
    );
    assert.match(
      w.document.querySelector("#toast").textContent,
      /New order received/,
    );
    await w.testHooks.notifications();
    assert.ok(w.document.querySelector(".notification-row.unread"));
    w.document.querySelector("#markVisibleRead").click();
    await flush();
    assert.equal(
      w.document.querySelector("#notificationCount").textContent,
      "0",
    );
    assert.equal(w.document.querySelector(".notification-row.unread"), null);
    w.document.querySelector("#dialog").close();
    await flush();
    state.status = "Cancelled";
    await w.testHooks.checkOrderUpdates();
    assert.equal(w.document.querySelector('[data-stage="1"]'), null);
    assert.match(
      w.document.querySelector("#order-1").textContent,
      /stock restored/,
    );
  } finally {
    dom.window.close();
  }
});
