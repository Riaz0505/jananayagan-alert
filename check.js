const { chromium } = require('playwright');
const axios = require('axios');

// Railway-la set panna pora variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const URL = "https://in.bookmyshow.com/explore/movies-tiruppur";
const INTERVAL = 90 * 1000;

async function sendTelegram(msg) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      chat_id: CHAT_ID,
      text: msg,
      disable_web_page_preview: true
    }
  );
}

async function checkMovie() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("Checking BookMyShow Tiruppur...");

    await page.goto(URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const text = await page.evaluate(() =>
      document.body.innerText.toLowerCase()
    );

    if (text.includes("jananayagan")) {
      await sendTelegram(
        "🎬 JANANAYAGAN TICKET OPEN 🔥\n📍 Tiruppur\n👉 Open BookMyShow NOW!"
      );
      await browser.close();
      process.exit(0);
    }

    console.log("Not open yet...");
  } catch (e) {
    console.error(e.message);
  }

  await browser.close();
}

checkMovie();
setInterval(checkMovie, INTERVAL);
