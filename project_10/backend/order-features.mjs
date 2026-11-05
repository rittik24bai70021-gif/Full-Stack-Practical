// Order reports use persisted order-item snapshots, never current catalog prices.
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const rupees = (value) => "₹" + Number(value).toLocaleString("en-IN");

export function invoiceHtml(order, items) {
  const e = escapeHtml;
  const code = "BV-" + String(order.id).padStart(4, "0");
  const date = new Date(order.created).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${code} — BookVerse invoice</title><style>
  *{box-sizing:border-box}body{font:15px/1.6 Arial,sans-serif;color:#202b3c;background:#f1f4f8;margin:0;padding:35px}main{max-width:850px;margin:auto;background:white;padding:40px;border:1px solid #dce2ea}header{display:flex;justify-content:space-between;border-bottom:3px solid #3864b5;padding-bottom:20px}h1{margin:0;color:#3864b5}h2{font-size:20px}p{white-space:pre-wrap}.meta{display:flex;justify-content:space-between;gap:30px;margin:25px 0}.badge{background:#e9eff9;padding:6px 12px;display:inline-block}table{border-collapse:collapse;width:100%;margin:25px 0}th,td{border-bottom:1px solid #dce2ea;text-align:left;padding:12px 7px}th{background:#f1f4f8}.right{text-align:right}.total{text-align:right;font-size:20px;font-weight:bold}.note{font-size:12px;color:#5e6b7e;border-top:1px solid #dce2ea;padding-top:20px}.print-hint{max-width:850px;margin:0 auto 18px;font-size:13px}.cancelled{color:#ad3434}@media(max-width:600px){body{padding:10px}main{padding:20px}.meta,header{display:block}table{font-size:12px}}@media print{body{padding:0;background:white}main{border:0;padding:10px}.print-hint{display:none}tr{break-inside:avoid}}
  </style></head><body><div class="print-hint">Print this invoice or choose Save as PDF using your browser’s Print menu (Ctrl+P / Cmd+P).</div><main><header><div><h1>BookVerse</h1><div>Order invoice · Academic demonstration</div></div><div><strong>${code}</strong><br>${e(date)} IST</div></header><div class="meta"><div><h2>Billed to / deliver to</h2><strong>${e(order.name)}</strong><br>${e(order.email)}<p>${e(order.address)}</p></div><div><h2>Order details</h2><span class="badge">${e(order.status)}</span><p>Payment method: Cash on delivery<br>Payment collection: Not processed (demo)</p></div></div>${order.status === "Cancelled" ? '<p class="cancelled"><strong>CANCELLED — no amount is due for this order.</strong></p>' : ""}<table><thead><tr><th>Book</th><th>Qty</th><th class="right">Unit price</th><th class="right">Amount</th></tr></thead><tbody>${items.map((i) => `<tr><td>${e(i.title)}</td><td>${i.quantity}</td><td class="right">${rupees(i.price)}</td><td class="right">${rupees(i.price * i.quantity)}</td></tr>`).join("")}</tbody></table><p class="right">Delivery: Free<br>Tax: Not calculated in this academic demo</p><p class="total">Original order total: ${rupees(order.total)}</p><p class="note">This is an academic order record, not a tax invoice or proof of payment. No real payment or delivery is processed.<br>Developed by Rittik Basak · 24BAI70021 · Full Stack–II Project 10.</p></main></body></html>`;
}

export function getAnalytics(db) {
  const summary = db
    .prepare(
      `SELECT COUNT(*) AS totalOrders,
    COALESCE(SUM(CASE WHEN status IN ('Placed','Packed','Shipped') THEN 1 ELSE 0 END),0) AS pendingOrders,
    COALESCE(SUM(CASE WHEN status='Delivered' THEN total ELSE 0 END),0) AS deliveredValue,
    COALESCE(SUM(CASE WHEN status='Cancelled' THEN 1 ELSE 0 END),0) AS cancelledOrders
    FROM orders`,
    )
    .get();
  const lowStock = db
    .prepare(
      "SELECT id,title,stock FROM books WHERE active=1 AND stock<=5 ORDER BY stock,title",
    )
    .all();
  const dailyRows = db
    .prepare(
      `SELECT date(created,'+5 hours','+30 minutes') AS day,COUNT(*) AS count FROM orders GROUP BY day`,
    )
    .all();
  const counts = new Map(dailyRows.map((r) => [r.day, r.count]));
  // Build seven calendar days in India, regardless of the host computer's timezone.
  const now = new Date(Date.now() + 330 * 60 * 1000);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - 6 + i);
    const day = d.toISOString().slice(0, 10);
    return { day, count: counts.get(day) || 0 };
  });
  const statuses = [
    "Placed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ].map((status) => ({
    status,
    count: db
      .prepare("SELECT COUNT(*) AS count FROM orders WHERE status=?")
      .get(status).count,
  }));
  return {
    ...summary,
    activeTitles: db
      .prepare("SELECT COUNT(*) AS count FROM books WHERE active=1")
      .get().count,
    lowStock,
    days,
    statuses,
  };
}
