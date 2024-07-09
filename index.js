const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://song.lk/new-songs.html';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

async function scrapeDownloadLink(songUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(songUrl, { waitUntil: 'networkidle2' });

  const downloadLink = await page.evaluate(() => {
    const linkElement = document.querySelector('a.btn.btn-light.w-100.mt-2');
    return linkElement ? linkElement.href : '';
  });

  await browser.close();
  return downloadLink.trim();
}

// Route
app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const songData = await page.evaluate(async () => {
      const songElement = document.querySelector('.song_card_cont #song_card');
      if (!songElement) return null;

      const songTitle = songElement.querySelector('p').innerText.trim();
      const artistName = songElement.querySelector('#artist_name').innerText.trim();
      const songUrl = songElement.closest('a').href;

      return {
        title: songTitle,
        artist: artistName,
        url: songUrl,
      };
    });

    if (songData) {
      const downloadLink = await scrapeDownloadLink(songData.url);
      songData.download_link = downloadLink;
      songData.poweredby = "NBDEV-SL";
      res.json([songData]);
    } else {
      res.status(404).json({ error: 'No song found' });
    }

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
