const { chromium } = require("playwright");
const axios = require("axios");

// ================== CONFIG ==================
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Tiruppur focus
const BMS_URL = "https://in.bookmyshow.com/explore/movies-tiruppur";
const TICKETNEW_URL = "https://www.ticketnew.com/Online-Ticket-Booking/Cinemas";
const DISTRICT_URL = "https://www.district.in/movies";

const INTERVAL = 2 * 60 * 1000; // 2 minutes (SAFE)
// ============================================

let alertSent = false;

// ---------- TELEGRAM ----------
async function sendTelegram(message) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      chat_id: CHAT_ID,
      text: message,
      disable_web_page_preview: true,
    }
  );
}

async function sendOnce(message) {
  if (alertSent) return;
  alertSent = true;
  await sendTelegram(message);
  console.log("ALERT SENT. Stopping bot.");
  process.exit(0);
}

// ---------- BOOKMYSHOW ----------
async function checkBMS() {
  console.log("Checking BookMyShow Tiruppur...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BMS_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const text = await page.evaluate(() =>
      document.body.innerText.toLowerCase()
    );

    if (
      text.includes("jananayagan") &&
      text.includes("book")
    ) {
      await sendOnce(
        "🎬 JANANAYAGAN TICKET OPEN 🔥\n" +
        "📍 Tiruppur\n" +
        "🎟️ Platform: BookMyShow\n" +
        "⚡ Book FAST!"
      );
    } else {
      console.log("BMS: Not open yet...");
    }
  } catch (e) {
    console.log("BMS error skipped");
  }

  await browser.close();
}

// ---------- TICKETNEW ----------
async function checkTicketNew() {
  console.log("Checking TicketNew...");
  try {
    const res = await axios.get(TICKETNEW_URL, { timeout: 20000 });
    const html = res.data.toLowerCase();

    if (html.includes("jananayagan")) {
      await sendOnce(
        "🎬 JANANAYAGAN TICKET OPEN 🔥\n" +
        "📍 Tiruppur\n" +
        "🎟️ Platform: TicketNew\n" +
        "⚡ Book FAST!"
      );
    } else {
      console.log("TicketNew: Not open yet...");
    }
  } catch (e) {
    console.log("TicketNew check skipped");
  }
}

// ---------- DISTRICT ----------
async function checkDistrict() {
  console.log("Checking District...");
  try {
    const res = await axios.get(DISTRICT_URL, { timeout: 20000 });
    const html = res.data.toLowerCase();

    if (html.includes("jananayagan")) {
      await sendOnce(
        "🎬 JANANAYAGAN TICKET OPEN 🔥\n" +
        "📍 Tiruppur\n" +
        "🎟️ Platform: District\n" +
        "⚡ Book FAST!"
      );
    } else {
      console.log("District: Not open yet...");
    }
  } catch (e) {
    console.log("District check skipped");
  }
}

// ---------- MAIN LOOP ----------
async function runAll() {
  await checkBMS();
  await checkTicketNew();
  await checkDistrict();
}

runAll();
setInterval(runAll, INTERVAL);
