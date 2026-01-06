const axios = require("axios");

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Movie + city
const MOVIE_WORDS = ["jana", "nayagan"];
const CITY = "tirupur";

// BookMyShow showtimes API (CITY BASED)
const BMS_SHOWTIME_API =
  "https://in.bookmyshow.com/api/explore/v1/showtimes/tirupur";

// Ticket platforms
const TICKETNEW_URL =
  "https://www.ticketnew.com/Online-Ticket-Booking/Cinemas";
const DISTRICT_URL = "https://www.district.in/movies";

const INTERVAL = 2 * 60 * 1000;
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
  process.exit(0);
}

// ---------- HELPER ----------
function movieMatch(text) {
  return MOVIE_WORDS.every((w) => text.includes(w));
}

// ---------- BOOKMYSHOW (REAL FIX) ----------
async function checkBMS() {
  console.log("Checking BookMyShow SHOWTIMES (Tirupur)...");
  try {
    const res = await axios.get(BMS_SHOWTIME_API, { timeout: 20000 });
    const data = JSON.stringify(res.data).toLowerCase();

    if (movieMatch(data)) {
      await sendOnce(
        "🎬 JANA NAYAGAN TICKET OPEN 🔥\n" +
        "📍 City: Tirupur\n" +
        "🎟️ Platform: BookMyShow\n" +
        "⚡ Showtimes LIVE!"
      );
    } else {
      console.log("BMS: Not open yet...");
    }
  } catch (e) {
    console.log("BMS API check skipped");
  }
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
        "🎟️ Platform: TicketNew"
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
        "🎟️ Platform: District"
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
