// BookVerse frontend — Rittik Basak, 24BAI70021
const API = "http://localhost:8080/api";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
let maxPrice = 100000,
  stockOnly = false;
let token = sessionStorage.getItem("bookverseToken") || "",
  user = null,
  books = [],
  cart = [],
  saved = [],
  view = "catalog",
  query = "",
  category = "All genres",
  mood = "All stories",
  sort = "curated",
  timer;
async function api(path, method = "GET", body) {
  let r;
  try {
    r = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw Error(
      "Cannot reach the backend. Start backend with npm start, then retry.",
    );
  }
  const d = await r.json();
  if (!r.ok) {
    if (r.status === 401 && user) {
      token = "";
      user = null;
      cart = [];
      saved = [];
      sessionStorage.removeItem("bookverseToken");
      header();
    }
    throw Error(d.error || "Request failed.");
  }
  return d;
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").style.display = "block";
  clearTimeout(timer);
  timer = setTimeout(() => ($("#toast").style.display = "none"), 3800);
}
function open(html) {
  $("#modal").innerHTML = html;
  if (!$("#dialog").open) $("#dialog").showModal();
}
function close() {
  $("#dialog").close();
}
$("#close").onclick = close;
function header() {
  $("#account").textContent = user
    ? user.name.split(" ")[0] + " ↗"
    : "Sign in ↗";
  $("#adminNav").hidden = user?.role !== "ADMIN";
  $("#notifications").hidden = user?.role !== "ADMIN";
  if (!user) resetOrderWatch();
  $("#count").textContent = cart.reduce((s, b) => s + b.quantity, 0);
  document
    .querySelectorAll("[data-view]")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
}
async function sync() {
  books = await api("/books");
  if (user) [cart, saved] = await Promise.all([api("/cart"), api("/wishlist")]);
  header();
}
function cover(b) {
  if (
    b.cover &&
    (/^data:image\/(png|jpeg|webp);base64,/.test(b.cover) ||
      /^\/assets\/book-\d+\.jpg$/.test(b.cover))
  )
    return `<img class="book-image" src="${esc(b.cover)}" alt="Cover of ${esc(b.title)}" loading="lazy">`;
  return `<div class="cover ${b.title.length > 25 ? "long-title" : ""}" style="background:${/^#[0-9a-f]{6}$/i.test(b.color) ? b.color : "#285a48"}"><small>BOOKVERSE EDITIONS</small><b>${esc(b.title)}</b><span class="ornament" aria-hidden="true">✳</span><small>${esc(b.author)}</small></div>`;
}
function card(b) {
  return `<article class="card"><div class="cover-wrap">${cover(b)}<button class="save" data-save="${b.id}" aria-label="${saved.includes(b.id) ? "Remove from" : "Add to"} bookshelf" aria-pressed="${saved.includes(b.id)}">${saved.includes(b.id) ? "♥" : "♡"}</button></div><div class="category">${esc(b.category)} · ${esc(b.mood)}</div><h3><button class="title-button" data-detail="${b.id}">${esc(b.title)}</button></h3><p>${esc(b.author)}</p><div class="card-bottom"><span class="price">${money(b.price)}</span><button data-add="${b.id}" ${b.stock === 0 ? "disabled" : ""}>${b.stock === 0 ? "Sold out" : "+ Add to bag"}</button></div></article>`;
}
function filtered() {
  let a = books.filter(
    (b) =>
      (view !== "saved" || saved.includes(b.id)) &&
      (category === "All genres" || category === b.category) &&
      (mood === "All stories" || mood === b.mood) &&
      `${b.title} ${b.author}`.toLowerCase().includes(query.toLowerCase()) &&
      b.price <= maxPrice &&
      (!stockOnly || b.stock > 0),
  );
  if (sort === "low") a.sort((a, b) => a.price - b.price);
  if (sort === "high") a.sort((a, b) => b.price - a.price);
  if (sort === "az") a.sort((a, b) => a.title.localeCompare(b.title));
  return a;
}
function results() {
  const a = filtered();
  $("#results").innerHTML = a.length
    ? a.map(card).join("")
    : '<div class="empty">No books found. Try another search or genre.</div>';
  $("#resultCount").textContent =
    `${a.length} ${a.length === 1 ? "story" : "stories"} to explore`;
}
function catalog() {
  const genres = [...new Set(books.map((b) => b.category))].sort();
  $("#main").innerHTML = `${
    view === "catalog"
      ? `<section class="shop-hero"><div class="hero-text"><span class="eyebrow">THE CLASSICS COLLECTION</span><h1>Find a book.<br>Make time for yourself.</h1><p>Old favourites, unexpected discoveries, and stories worth switching your phone off for.</p><button class="primary" id="explore">Browse the shelves →</button><div class="hero-meta">Paperback collection <span>•</span> Prices from ${money(Math.min(...books.map((b) => b.price), 239))}</div></div><div class="hero-books">${books
          .slice(1, 4)
          .map((b) => `<div>${cover(b)}</div>`)
          .join(
            "",
          )}<span class="shelf-label">A few good places to begin.</span></div></section><div class="shop-benefits"><span><b>Delivered to your door</b>Free delivery on all demo orders</span><span><b>A shelf of your own</b>Save books and come back anytime</span><span><b>Choose your next chapter</b>Browse by genre, budget or mood</span></div>`
      : ""
  }<section id="collection"><div class="section-top"><div><div class="eyebrow">${view === "saved" ? "SAVED FOR LATER" : "THE BOOKSTORE"}</div><h2>${view === "saved" ? "Your wishlist" : "Browse the collection"}</h2></div><p class="subtle" id="resultCount"></p></div><div class="shop-layout"><aside class="filter-panel"><h3>Find your kind of book</h3><label for="genre">Genre</label><select id="genre">${["All genres", ...genres].map((g) => `<option ${g === category ? "selected" : ""}>${esc(g)}</option>`).join("")}</select><label for="budget">Your budget</label><select id="budget">${[
    [100000, "Any price"],
    [300, "Under ₹301"],
    [400, "Under ₹401"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${maxPrice === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select><label class="check-label"><input type="checkbox" id="inStock" ${stockOnly ? "checked" : ""}> In-stock books only</label><button id="resetFilters">Reset filters</button><div class="filter-note"><span>THE READER’S NOTE</span><p>“A good book doesn't ask you to hurry.”</p><small>Take your time. Your next read is here.</small></div></aside><div class="catalog-content"><div class="search"><input id="search" aria-label="Search books or authors" placeholder="Search titles, authors…" value="${esc(query)}"><select id="sort" aria-label="Sort books">${[
    ["curated", "Featured"],
    ["low", "Price: low to high"],
    ["high", "Price: high to low"],
    ["az", "Title: A to Z"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${sort === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></div><div class="chips">${["All stories", "Escape", "Explore", "Feel good", "Solve"].map((m) => `<button data-mood="${m}" class="${m === mood ? "selected" : ""}">${m}</button>`).join("")}</div><div class="grid" id="results"></div></div></div></section><section class="editorial"><div><div class="eyebrow">SOMETHING DIFFERENT</div><h2>Not sure what to read next?</h2><p>Let us pick a book from the shelf. You might find a new favourite.</p></div><button id="surprise">Surprise me →</button></section>`;
  results();
  $("#search").oninput = (e) => {
    query = e.target.value;
    results();
  };
  $("#genre").onchange = (e) => {
    category = e.target.value;
    results();
  };
  $("#budget").onchange = (e) => {
    maxPrice = Number(e.target.value);
    results();
  };
  $("#inStock").onchange = (e) => {
    stockOnly = e.target.checked;
    results();
  };
  $("#resetFilters").onclick = () => {
    query = "";
    category = "All genres";
    mood = "All stories";
    maxPrice = 100000;
    stockOnly = false;
    sort = "curated";
    catalog();
  };
  $("#sort").onchange = (e) => {
    sort = e.target.value;
    results();
  };
  $("#explore")?.addEventListener("click", () =>
    $("#collection").scrollIntoView({ behavior: "smooth" }),
  );
  $("#surprise").onclick = () => {
    if (books.length)
      detail(books[Math.floor(Math.random() * books.length)].id);
    else toast("The shelves are empty. Check back soon.");
  };
}
async function navigate(v) {
  if (["saved", "orders", "admin"].includes(v) && !user) {
    authModal();
    return;
  }
  if (v === "admin" && user.role !== "ADMIN") return;
  view = v;
  header();
  try {
    if (v === "orders") await orders();
    else if (v === "admin") await admin();
    else catalog();
  } catch (e) {
    $("#main").innerHTML =
      `<div class="empty"><h2>We couldn’t load this page.</h2><p>${esc(e.message)}</p><button data-retry="1">Retry</button></div>`;
  }
}
function authModal(register = false, loginType = "CUSTOMER") {
  open(
    `<div class="eyebrow">YOUR BOOKVERSE ACCOUNT</div><div class="login-tabs"><button type="button" id="customerLogin" class="${loginType === "CUSTOMER" ? "selected" : ""}">Customer login</button><button type="button" id="adminLogin" class="${loginType === "ADMIN" ? "selected" : ""}">Admin login</button></div><h2>${register ? "Create your reader account" : loginType === "ADMIN" ? "Manage your bookstore" : "Welcome back, reader"}</h2><p>${register ? "Create your account to save books and place orders." : loginType === "ADMIN" ? "Sign in to manage books, stock and customer orders." : "Sign in to your reading world."}</p><form id="authForm">${register ? '<label for="name">Full name</label><input id="name" name="name" required minlength="2" maxlength="60" autocomplete="name">' : ""}<label for="email">Email address</label><input id="email" name="email" type="email" required autocomplete="email"><label for="password">Password</label><input id="password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="${register ? "new-password" : "current-password"}"><p class="error" id="formError" role="alert"></p><button class="primary">${register ? "Create account" : "Sign in"} ↗</button></form><p class="hint" ${loginType === "ADMIN" ? "hidden" : ""}>${register ? "Already a member?" : "New to BookVerse?"} <button id="switchAuth">${register ? "Sign in" : "Create an account"}</button></p><p class="hint">Local demonstration accounts are listed in the project README.</p>`,
  );
  $("#switchAuth").onclick = () => authModal(!register, "CUSTOMER");
  $("#customerLogin").onclick = () => authModal(false, "CUSTOMER");
  $("#adminLogin").onclick = () => authModal(false, "ADMIN");
  $("#authForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try {
      const d = await api(
        "/auth/" + (register ? "register" : "login"),
        "POST",
        { ...Object.fromEntries(new FormData(e.target)), loginType },
      );
      token = d.token;
      user = d.user;
      sessionStorage.setItem("bookverseToken", token);
      await sync();
      close();
      await navigate(user.role === "ADMIN" ? "admin" : "catalog");
      resetOrderWatch();
      void checkOrderUpdates();
      if (user.role === "CUSTOMER") welcome();
      else toast("Admin dashboard ready.");
    } catch (e) {
      $("#formError").textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  };
}
$("#account").onclick = () => {
  if (!user) return authModal();
  open(
    `<div class="eyebrow">YOUR ACCOUNT</div><h2>${esc(user.name)}</h2><p>${esc(user.email)}<br>${esc(user.role)}</p><button class="primary" id="logout">Sign out</button>`,
  );
  $("#logout").onclick = async () => {
    try {
      await api("/auth/logout", "POST", {});
    } catch {}
    token = "";
    user = null;
    cart = [];
    saved = [];
    sessionStorage.removeItem("bookverseToken");
    close();
    navigate("catalog");
  };
};
async function add(id) {
  if (!user) return authModal();
  const q = cart.find((b) => b.id === id)?.quantity || 0;
  await api("/cart", "PUT", { bookId: id, quantity: q + 1 });
  await sync();
  toast("Added to your book bag.");
}
async function save(id) {
  if (!user) return authModal();
  await api("/wishlist", "PUT", { bookId: id, saved: !saved.includes(id) });
  await sync();
  if (["catalog", "saved"].includes(view)) results();
  toast("Bookshelf updated.");
}
function detail(id) {
  const b = books.find((x) => x.id === id);
  if (!b) return;
  open(
    `<div class="detail">${cover(b)}<div><div class="eyebrow">${esc(b.category)}</div><h2>${esc(b.title)}</h2><p>by ${esc(b.author)}</p><p>${esc(b.description)}</p><p class="price">${money(b.price)}</p><p class="hint">${b.stock} copies available · Mood: ${esc(b.mood)}</p><button class="primary" data-add="${b.id}" ${b.stock === 0 ? "disabled" : ""}>Add to book bag</button></div></div>`,
  );
}
function bag() {
  if (!user) return authModal();
  open(
    `<div class="eyebrow">GOOD STORIES, GREAT COMPANY</div><h2>Your book bag</h2>${cart.length ? cart.map((b) => `<div class="row"><div><h3>${esc(b.title)}</h3><span class="hint">${money(b.price)} each</span></div><div class="quantity"><button data-qty="${b.id}" data-value="${b.quantity - 1}" aria-label="Decrease quantity">−</button><span>${b.quantity}</span><button data-qty="${b.id}" data-value="${b.quantity + 1}" aria-label="Increase quantity">+</button><button data-qty="${b.id}" data-value="0" aria-label="Remove book">×</button></div></div>`).join("") + `<div class="row"><span>Subtotal · Free delivery</span><strong>${money(cart.reduce((s, b) => s + b.price * b.quantity, 0))}</strong></div><form id="checkout"><label for="address">Delivery address</label><textarea id="address" name="address" required minlength="10" maxlength="500" rows="3" placeholder="House, street, city, state and PIN code"></textarea><p class="hint">Cash on delivery · Academic demo. No real payment or shipment is processed.</p><p id="checkoutError" class="error" role="alert"></p><button class="primary">Place demo order ↗</button></form>` : '<div class="empty">Your bag is waiting for a good story.</div>'}`,
  );
  $("#checkout")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = e.target.querySelector("button");
    b.disabled = true;
    try {
      const o = await api("/orders", "POST", { address: $("#address").value });
      await sync();
      close();
      await navigate("orders");
      toast("Order BV-" + String(o.id).padStart(4, "0") + " placed!");
    } catch (e) {
      $("#checkoutError").textContent = e.message;
    } finally {
      b.disabled = false;
    }
  });
}
$("#bag").onclick = bag;
const orderCode = (id) => "BV-" + String(id).padStart(4, "0");
const stages = ["Placed", "Packed", "Shipped", "Delivered"];
let customerSignature = "",
  adminSignature = "";
let observedStatuses = null,
  observedEvents = null,
  watchSession = "",
  watchBusy = false;
let notificationState = { items: [], unreadCount: 0 };
let lastSuccessfulCheck = null;

function liveStatus() {
  return `<div class="live-status"><span class="live-dot"></span><span id="liveText">Checks every 10 seconds while this tab is visible.</span><button data-refresh-orders="1">Refresh now</button></div>`;
}
function updateLiveText(message) {
  const e = $("#liveText");
  if (e)
    e.textContent =
      message ||
      "Updated " +
        new Date().toLocaleTimeString("en-IN") +
        " · checks every 10 seconds";
}
function renderCustomerOrders(list) {
  customerSignature = JSON.stringify(list);
  $("#main").innerHTML =
    `<div class="eyebrow">FROM OUR SHELF TO YOURS</div><h1 style="font-size:44px">Your orders</h1><p>Track your books, download an invoice or cancel before packing.</p>${liveStatus()}${list.length ? list.map((o) => `<article class="order" id="order-${o.id}"><div class="row"><h3>${orderCode(o.id)}</h3><span>${new Date(o.created).toLocaleDateString("en-IN")}</span><span class="status ${o.status === "Cancelled" ? "cancelled" : ""}">${esc(o.status)}</span></div>${o.status === "Cancelled" ? '<p class="cancellation-note">This order was cancelled. Stock has been restored; no payment is due.</p>' : `<div class="steps">${stages.map((s, i) => `<span class="${i <= stages.indexOf(o.status) ? "done" : ""}">${s}</span>`).join("")}</div>`}${o.items.map((i) => `<div class="row"><span>${esc(i.title)} × ${i.quantity}</span><strong>${money(i.price * i.quantity)}</strong></div>`).join("")}<p>Delivery to: ${esc(o.address)}</p><div class="order-actions"><strong>${o.status === "Cancelled" ? "Original total" : "Total"} ${money(o.total)}</strong><button data-invoice="${o.id}">Download invoice</button>${o.status === "Placed" ? `<button class="danger" data-cancel="${o.id}">Cancel order</button>` : ""}</div><p class="hint">Cash-on-delivery demonstration · No real payment processed.</p></article>`).join("") : '<div class="empty"><h2>Your next story is waiting.</h2><p>No orders yet.</p><button data-view="catalog">Discover books</button></div>'}`;
}
async function orders() {
  const session = token;
  const list = await api("/orders");
  if (token !== session || view !== "orders") return;
  if (!observedStatuses)
    observedStatuses = new Map(list.map((o) => [o.id, o.status]));
  renderCustomerOrders(list);
}
function analyticsHtml(a) {
  const maximum = Math.max(1, ...a.days.map((d) => d.count));
  return `<section class="stats expanded-stats"><div class="stat">Total orders<strong>${a.totalOrders}</strong><small>Includes cancelled orders</small></div><div class="stat">Pending fulfilment<strong>${a.pendingOrders}</strong><small>Placed, packed or shipped</small></div><div class="stat">Delivered order value<strong>${money(a.deliveredValue)}</strong><small>COD demo · not collected revenue</small></div><div class="stat">Cancelled orders<strong>${a.cancelledOrders}</strong><small>Stock restored</small></div></section><div class="insights-grid"><section class="insight"><h3>Orders over the last 7 days</h3><p class="hint">India calendar dates · all placed orders, including later cancellations</p><div class="bar-chart" role="img" aria-label="Daily order counts: ${a.days.map((d) => d.day + ": " + d.count).join(", ")}">${a.days.map((d) => `<div class="bar-column"><strong>${d.count}</strong><div class="bar-track"><div class="bar-fill" style="height:${(d.count / maximum) * 100}%"></div></div><span>${d.day.slice(8)}/${d.day.slice(5, 7)}</span></div>`).join("")}</div></section><section class="insight"><h3>Low-stock watch <span class="status">${a.lowStock.length}</span></h3><p class="hint">${a.activeTitles} active titles · alert at 5 copies or fewer</p>${a.lowStock.length ? `<ul class="stock-list">${a.lowStock.map((b) => `<li><span>${esc(b.title)}</span><strong>${b.stock} left</strong><button data-edit="${b.id}">Restock</button></li>`).join("")}</ul>` : '<p class="empty-small">All active books have more than 5 copies.</p>'}</section></div><div class="status-summary">${a.statuses.map((s) => `<span>${s.status} <b>${s.count}</b></span>`).join("")}</div>`;
}
function renderAdmin(payload) {
  const { list, analytics, catalog } = payload;
  books = catalog;
  adminSignature = JSON.stringify(payload);
  $("#main").innerHTML =
    `<div class="section-top"><div><div class="eyebrow">ADMIN DASHBOARD · BOOKVERSE</div><h1 style="font-size:42px">Your bookstore, at a glance.</h1></div><button class="primary" id="newBook">+ Add a book</button></div>${liveStatus()}${analyticsHtml(analytics)}<h2>Catalog & inventory</h2><p class="hint">Removed books remain in historical orders.</p><div class="table-scroll"><table><thead><tr><th>Book</th><th>Genre</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${books.map((b) => `<tr><td><strong>${esc(b.title)}</strong><br>${esc(b.author)}</td><td>${esc(b.category)}</td><td>${money(b.price)}</td><td class="${b.stock <= 5 ? "stock" : ""}">${b.stock}${b.stock <= 5 ? " · Low" : ""}</td><td><button data-edit="${b.id}">Edit</button> <button class="danger" data-delete="${b.id}">Remove</button></td></tr>`).join("")}</tbody></table></div><h2 style="margin-top:40px" id="orderDesk">Order desk</h2>${list.length ? list.map((o) => `<article class="order" id="order-${o.id}"><div class="row"><strong>${orderCode(o.id)} · ${esc(o.name)}</strong><span class="status ${o.status === "Cancelled" ? "cancelled" : ""}">${esc(o.status)}</span><strong>${money(o.total)}</strong></div><p>${esc(o.email)}<br>${esc(o.address)}</p><p>${o.items.map((i) => esc(i.title) + " × " + i.quantity).join(" · ")}</p><div class="order-actions"><button data-invoice="${o.id}">Download invoice</button>${["Placed", "Packed", "Shipped"].includes(o.status) ? `<button class="primary" data-stage="${o.id}" data-next="${stages[stages.indexOf(o.status) + 1]}">Mark ${stages[stages.indexOf(o.status) + 1]} →</button>` : `<span class="hint">${o.status === "Cancelled" ? "Cancelled by customer · stock restored" : "Delivery complete"}</span>`}</div></article>`).join("") : "<p>No orders yet. New orders will appear automatically.</p>"}`;
  $("#newBook").onclick = () => editor();
}
async function adminPayload() {
  const [list, analytics, catalog] = await Promise.all([
    api("/admin/orders"),
    api("/admin/analytics"),
    api("/books"),
  ]);
  return { list, analytics, catalog };
}
async function admin() {
  const session = token;
  const payload = await adminPayload();
  if (token === session && view === "admin" && user?.role === "ADMIN")
    renderAdmin(payload);
}

// Polling updates saved data; it does not simulate orders or require a page reload.
function resetOrderWatch() {
  watchSession = "";
  observedStatuses = null;
  observedEvents = null;
  notificationState = { items: [], unreadCount: 0 };
  customerSignature = "";
  adminSignature = "";
  lastSuccessfulCheck = null;
  $("#notificationCount").textContent = "0";
}
async function checkOrderUpdates() {
  if (!user || !token || watchBusy || document.hidden) return;
  const session = token,
    role = user.role;
  watchBusy = true;
  if (watchSession !== session) {
    watchSession = session;
    observedStatuses = null;
    observedEvents = null;
  }
  try {
    if (role === "ADMIN") {
      const next = await api("/admin/notifications");
      if (token !== session) return;
      const previousEvents = observedEvents;
      const newUnread = next.items.filter(
        (n) => !n.is_read && previousEvents && !previousEvents.has(n.id),
      );
      if (!previousEvents && next.unreadCount)
        toast(
          `You have ${next.unreadCount} unread order notification${next.unreadCount === 1 ? "" : "s"}.`,
        );
      else if (newUnread.length)
        toast(
          newUnread.length === 1
            ? (newUnread[0].kind === "Placed"
                ? "New order received: "
                : "Order cancelled: ") + orderCode(newUnread[0].order_id)
            : `${newUnread.length} new order updates received.`,
        );
      observedEvents = new Set([
        ...(previousEvents || []),
        ...next.items.map((n) => n.id),
      ]);
      notificationState = next;
      $("#notificationCount").textContent = next.unreadCount;
      $("#notifications").setAttribute(
        "aria-label",
        `Order notifications, ${next.unreadCount} unread`,
      );
      if (view === "admin" && !$("#dialog").open) {
        const payload = await adminPayload();
        if (
          token === session &&
          view === "admin" &&
          !$("#dialog").open &&
          JSON.stringify(payload) !== adminSignature
        )
          renderAdmin(payload);
      }
    } else {
      const list = await api("/orders");
      if (token !== session) return;
      if (observedStatuses) {
        const changed = list.filter(
          (o) =>
            observedStatuses.has(o.id) &&
            observedStatuses.get(o.id) !== o.status,
        );
        if (changed.length)
          toast(
            changed.length === 1
              ? `${orderCode(changed[0].id)} is now ${changed[0].status.toLowerCase()}.`
              : `${changed.length} orders have status updates. Check My orders.`,
          );
      }
      observedStatuses = new Map(list.map((o) => [o.id, o.status]));
      if (
        view === "orders" &&
        !$("#dialog").open &&
        JSON.stringify(list) !== customerSignature
      )
        renderCustomerOrders(list);
    }
    if (token === session) {
      lastSuccessfulCheck = new Date();
      updateLiveText();
    }
  } catch (error) {
    if (token === session)
      updateLiveText(
        "Connection interrupted. Retrying every 10 seconds. Use Refresh now to retry.",
      );
  } finally {
    watchBusy = false;
  }
}
async function notifications() {
  if (user?.role !== "ADMIN") return;
  const session = token;
  const n = await api("/admin/notifications");
  if (token !== session) return;
  notificationState = n;
  $("#notificationCount").textContent = n.unreadCount;
  open(
    `<div class="eyebrow">ORDER ACTIVITY</div><h2>Notifications <span class="status">${n.unreadCount} unread</span></h2><p class="hint">New orders and customer cancellations. Read status is saved for your admin account.</p>${n.items.length ? n.items.map((item) => `<div class="notification-row ${item.is_read ? "" : "unread"}"><div><strong>${item.kind === "Placed" ? "New order" : "Order cancelled"} · ${orderCode(item.order_id)}</strong><p>${esc(item.name)} · ${money(item.total)}</p><small>${new Date(item.created).toLocaleString("en-IN")}</small></div><button data-open-order="${item.order_id}" data-event-id="${item.id}">View order</button></div>`).join("") : '<div class="empty-small">No order notifications yet.</div>'}${n.items.some((i) => !i.is_read) ? '<button id="markVisibleRead" class="primary">Mark displayed notifications as read</button>' : ""}`,
  );
  const mark = $("#markVisibleRead");
  if (mark)
    mark.onclick = async () => {
      mark.disabled = true;
      try {
        await api("/admin/notifications/read", "PUT", {
          ids: n.items.filter((i) => !i.is_read).map((i) => i.id),
        });
        await notifications();
      } catch (e) {
        mark.disabled = false;
        toast(e.message);
      }
    };
}
$("#notifications").onclick = () =>
  notifications().catch((e) => toast(e.message));
async function downloadInvoice(id) {
  const invoice = await api(`/orders/${id}/invoice`);
  const blob = new Blob([invoice.html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = invoice.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  toast("Invoice downloaded. Open it and use Print → Save as PDF if needed.");
}
function cancelOrder(id) {
  open(
    `<div class="eyebrow">CANCEL ORDER</div><h2>Cancel ${orderCode(id)}?</h2><p>This is available only before packing. Your books will be returned to stock. A cancelled order cannot be resumed; you can place a new order.</p><p id="cancelError" class="error" role="alert"></p><div class="order-actions"><button id="keepOrder">Keep order</button><button class="primary" id="confirmCancellation">Confirm cancellation</button></div>`,
  );
  $("#keepOrder").onclick = close;
  $("#confirmCancellation").onclick = async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      await api(`/orders/${id}/cancel`, "POST", {});
      if (observedStatuses) observedStatuses.set(id, "Cancelled");
      await sync();
      close();
      await navigate("orders");
      toast("Order cancelled. Stock has been restored.");
    } catch (e) {
      $("#cancelError").textContent = e.message;
      button.disabled = false;
    }
  };
}
setInterval(() => void checkOrderUpdates(), 10000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void checkOrderUpdates();
});
$("#dialog").addEventListener("close", () => void checkOrderUpdates());

function editor(id) {
  const b = books.find((b) => b.id === id) || {
    title: "",
    author: "",
    category: "Classics",
    price: 299,
    stock: 10,
    mood: "Escape",
    description: "",
    color: "#285a48",
  };
  open(
    `<div class="eyebrow">CATALOG STUDIO</div><h2>${id ? "Edit this story" : "Add a new story"}</h2><form id="bookForm"><div class="form-grid">${[
      ["title", "Title", "text"],
      ["author", "Author", "text"],
      ["category", "Genre", "text"],
      ["price", "Price (INR)", "number"],
      ["stock", "Copies in stock", "number"],
      ["color", "Cover colour", "color"],
    ]
      .map(
        ([k, l, t]) =>
          `<div><label for="${k}">${l}</label><input name="${k}" id="${k}" type="${t}" value="${esc(b[k])}" required ${t === "number" ? `min="${k === "price" ? 1 : 0}" max="${k === "price" ? 100000 : 10000}" step="1"` : ""}></div>`,
      )
      .join(
        "",
      )}</div><label for="mood">Reading mood</label><select name="mood" id="mood">${["Escape", "Explore", "Feel good", "Solve"].map((m) => `<option ${m === b.mood ? "selected" : ""}>${m}</option>`).join("")}</select><label for="coverUpload">Book cover (optional, max 1 MB)</label><input id="coverUpload" type="file" accept="image/png,image/jpeg,image/webp"><p class="hint">Upload a JPG, PNG or WebP. Leave empty to keep the existing cover.</p><label for="description">Description</label><textarea name="description" id="description" required minlength="10" maxlength="1000" rows="3">${esc(b.description)}</textarea><p class="error" id="editError" role="alert"></p><button class="primary">Save book</button></form>`,
  );
  $("#bookForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    const d = Object.fromEntries(new FormData(e.target));
    d.price = Number(d.price);
    d.stock = Number(d.stock);
    if (id) d.id = id;
    try {
      const file = $("#coverUpload").files[0];
      if (file) {
        if (file.size > 1000000)
          throw Error("Cover image must be 1 MB or smaller.");
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw Error("Use a JPG, PNG or WebP image.");
        d.cover = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      await api("/admin/books", id ? "PUT" : "POST", d);
      await sync();
      close();
      await admin();
      toast("Catalog saved.");
    } catch (e) {
      $("#editError").textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  };
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  try {
    if (b.dataset.view) {
      query = "";
      category = "All genres";
      mood = "All stories";
      await navigate(b.dataset.view);
    }
    if (b.dataset.mood) {
      mood = b.dataset.mood;
      catalog();
    }
    if (b.dataset.add) {
      b.disabled = true;
      await add(Number(b.dataset.add));
      b.disabled = false;
    }
    if (b.dataset.save) await save(Number(b.dataset.save));
    if (b.dataset.detail) detail(Number(b.dataset.detail));
    if (b.dataset.qty) {
      await api("/cart", "PUT", {
        bookId: Number(b.dataset.qty),
        quantity: Number(b.dataset.value),
      });
      await sync();
      bag();
    }
    if (b.dataset.edit) editor(Number(b.dataset.edit));
    if (b.dataset.delete) {
      const id = Number(b.dataset.delete);
      open(
        `<h2>Remove this book?</h2><p>It will leave the catalog, saved bookshelves and bags. Previous orders are preserved.</p><button class="primary" id="confirmDelete">Remove book</button>`,
      );
      $("#confirmDelete").onclick = async () => {
        try {
          await api("/admin/books?id=" + id, "DELETE");
          await sync();
          close();
          await admin();
          toast("Book removed.");
        } catch (e) {
          toast(e.message);
        }
      };
    }
    if (b.dataset.invoice) {
      b.disabled = true;
      try {
        await downloadInvoice(Number(b.dataset.invoice));
      } finally {
        b.disabled = false;
      }
    }
    if (b.dataset.cancel) cancelOrder(Number(b.dataset.cancel));
    if (b.dataset.refreshOrders) {
      b.disabled = true;
      try {
        if (view === "admin") await admin();
        else if (view === "orders") await orders();
        updateLiveText();
        await checkOrderUpdates();
      } finally {
        b.disabled = false;
      }
    }
    if (b.dataset.openOrder) {
      await api("/admin/notifications/read", "PUT", {
        ids: [Number(b.dataset.eventId)],
      });
      close();
      await navigate("admin");
      document
        .getElementById("order-" + b.dataset.openOrder)
        ?.scrollIntoView({ behavior: "smooth" });
      await checkOrderUpdates();
    }
    if (b.dataset.stage) {
      b.disabled = true;
      await api("/admin/orders", "PUT", {
        id: Number(b.dataset.stage),
        status: b.dataset.next,
      });
      await admin();
    }
    if (b.dataset.retry) await boot();
  } catch (e) {
    b.disabled = false;
    toast(e.message);
  }
});
async function boot() {
  $("#main").innerHTML = '<div class="empty">Opening the reading room…</div>';
  try {
    if (token) {
      try {
        user = await api("/auth/me");
      } catch (e) {
        token = "";
        sessionStorage.removeItem("bookverseToken");
      }
    }
    await sync();
    await navigate(view);
    void checkOrderUpdates();
  } catch (e) {
    $("#main").innerHTML =
      `<div class="empty"><h2>The reading room is taking a moment.</h2><p>${esc(e.message)}</p><button data-retry="1">Try again</button></div>`;
  }
}
boot();

document.querySelector("a.logo").onclick = (e) => {
  e.preventDefault();
  query = "";
  category = "All genres";
  mood = "All stories";
  navigate("catalog");
};

function welcome() {
  open(
    `<section class="welcome"><div class="welcome-icon">✦</div><div class="eyebrow">A LITTLE TIME, JUST FOR YOU</div><h2>Welcome, ${esc(user.name.split(" ")[0])}.</h2><blockquote>One book. A quiet moment.<br>A thousand places to go.</blockquote><p>Your next favourite story might be waiting on this shelf.</p><button class="primary" id="startReading">Find my next read →</button><p class="hint">Save your favourites with ♡ and build your own wishlist.</p></section>`,
  );
  $("#startReading").onclick = close;
}
const themeButton = $("#themeToggle");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("bookverseTheme", theme);
  themeButton.textContent = theme === "dark" ? "☀ Light mode" : "☾ Dark mode";
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
}
setTheme(localStorage.getItem("bookverseTheme") || "light");
themeButton.onclick = () =>
  setTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );
