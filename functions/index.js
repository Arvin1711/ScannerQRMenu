/**
 * Firebase Cloud Functions — WhatsApp alerts for waiter calls & bill requests
 *
 * SETUP:
 * 1. npm install -g firebase-tools
 * 2. firebase login
 * 3. firebase init functions  (choose JavaScript, your project)
 * 4. cd functions && npm install twilio
 * 5. Set secrets:
 *    firebase functions:secrets:set TWILIO_SID
 *    firebase functions:secrets:set TWILIO_TOKEN
 *    firebase functions:secrets:set TWILIO_FROM   (e.g. whatsapp:+14155238886)
 *    firebase functions:secrets:set RESTAURANT_WHATSAPP  (e.g. whatsapp:+919876543210)
 * 6. firebase deploy --only functions
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const TWILIO_SID    = defineSecret("TWILIO_SID");
const TWILIO_TOKEN  = defineSecret("TWILIO_TOKEN");
const TWILIO_FROM   = defineSecret("TWILIO_FROM");
const RESTAURANT_WA = defineSecret("RESTAURANT_WHATSAPP");

function sendWhatsApp(sid, token, from, to, body) {
  const twilio = require("twilio")(sid, token);
  return twilio.messages.create({ from, to, body });
}

// ── Waiter call alert ──
exports.onWaiterCall = onDocumentCreated(
  { document: "waiter_calls/{id}", secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, RESTAURANT_WA] },
  async (event) => {
    const data = event.data?.data() || {};
    const table = data.tableNumber ? `Table ${data.tableNumber}` : "a table";
    const body = `🔔 WAITER CALLED\nCustomer at ${table} needs assistance.`;
    try {
      await sendWhatsApp(
        TWILIO_SID.value(), TWILIO_TOKEN.value(),
        TWILIO_FROM.value(), RESTAURANT_WA.value(), body
      );
    } catch (e) {
      console.error("WhatsApp send failed:", e.message);
    }
  }
);

// ── Bill request alert ──
exports.onBillRequest = onDocumentCreated(
  { document: "bill_requests/{id}", secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, RESTAURANT_WA] },
  async (event) => {
    const data = event.data?.data() || {};
    const table = data.tableNumber ? `Table ${data.tableNumber}` : "a table";
    const body = `🧾 BILL REQUESTED\nCustomer at ${table} wants the bill.`;
    try {
      await sendWhatsApp(
        TWILIO_SID.value(), TWILIO_TOKEN.value(),
        TWILIO_FROM.value(), RESTAURANT_WA.value(), body
      );
    } catch (e) {
      console.error("WhatsApp send failed:", e.message);
    }
  }
);

// ── New order alert ──
exports.onNewOrder = onDocumentCreated(
  { document: "orders/{id}", secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, RESTAURANT_WA] },
  async (event) => {
    const data = event.data?.data() || {};
    const table = data.tableNumber ? `Table ${data.tableNumber}` : "";
    const itemLines = (data.items || [])
      .map((i) => `• ${i.name} ×${i.qty}`)
      .join("\n");
    const body = [
      "🛒 NEW ORDER",
      table && `Table: ${table}`,
      itemLines,
      `Total: ₹${(data.total || 0).toFixed(0)}`,
    ].filter(Boolean).join("\n");
    try {
      await sendWhatsApp(
        TWILIO_SID.value(), TWILIO_TOKEN.value(),
        TWILIO_FROM.value(), RESTAURANT_WA.value(), body
      );
    } catch (e) {
      console.error("WhatsApp send failed:", e.message);
    }
  }
);
