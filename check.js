const { chromium } = require("playwright");
const axios = require("axios");

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// City & movie keywords (IMPORTANT)
const CITY = "tirupur";
const MOVIE_KEYWORDS = ["jana", "nayagan"];

// BookMyShow MOVIE PAGE (PASTE REAL URL HERE)
const BMS_MOVIE_URL =
  "https://in.bookmyshow.com/movies/jana-nayagan/ET003XXXXX"; 
// 👆 IMPORTANT: Replace ET003XXXXX with real one

// Ticket platforms
const TICKETNEW_URL = "https://www.ticketnew.com/Online-Ticket-Booking/Cinemas";
const DISTRICT_URL = "https://www.district.in/movies";

const INTERVAL = 2 * 60 * 1000; // 2 minutes (SAFE)
// =========================================

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
  console.log("ALERT SENT. STOPPING BOT.");
  process.exit(0);
}

// ---------- HELPER ----------
function movieMatch(text) {
  return MOVIE_KEYWORDS.every((k) => text.includes(k));
}

// ---------- BOOKMYSHOW ----------
async function checkBMS() {
  console.log("Checking BookMyShow movie page...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BMS_MOVIE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const text = (await page.content()).toLowerCase();

    // Movie match + Book button
    const bookBtn = await page.$('button:has-text("Book")');

    if (movieMatch(text) && bookBtn) {
      await sendOnce(
        "🎬 JANA NAYAGAN TICKET OPEN 🔥\n" +
        "📍 City: Tirupur\n" +
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

    if (movieMatch(html) && html.includes(CITY)) {
      await sendOnce(
        "🎬 JANA NAYAGAN TICKET OPEN 🔥\n" +
        "📍 City: Tirupur\n" +
        "🎟️ Platform: TicketNew\n" +
        "⚡ Book FAST!"
      );
    } else {
      console.log("TicketNew: Not open yet...");
    }
  } catch (e) {
    console.log("TicketNew skipped");
  }
}

// ---------- DISTRICT ----------
async function checkDistrict() {
  console.log("Checking District...");
  try {
    const res = await axios.get(DISTRICT_URL, { timeout: 20000 });
    const html = res.data.toLowerCase();

    if (movieMatch(html) && html.includes(CITY)) {
      await sendOnce(
        "🎬 JANA NAYAGAN TICKET OPEN 🔥\n" +
        "📍 City: Tirupur\n" +
        "🎟️ Platform: District\n" +
        "⚡ Book FAST!"
      );
    } else {
      console.log("District: Not open yet...");
    }
  } catch (e) {
    console.log("District skipped");
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
