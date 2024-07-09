const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://song.lk/new-songs.html';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

async function scrapeDownloadLink(songUrl) {
  try {
    const response = await axios.get(songUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const downloadLink = $('a.btn.btn-light.w-100.mt-2').attr('href');
      return downloadLink.trim();
    }
  } catch (error) {
    console.error('Error scraping download link:', error);
  }
  return '';
}

// Route
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const songElement = $('.song_card_cont').first().find('#song_card');
      const songTitle = songElement.find('p').first().text().trim();
      const artistName = songElement.find('#artist_name').text().trim();
      const songUrl = songElement.parent('a').attr('href');
      const downloadLink = await scrapeDownloadLink(songUrl);

      const songData = {
        title: songTitle,
        artist: artistName,
        url: fullSongUrl,
        download_link: downloadLink,
        powerdby: "NBDEV-SL",
      };

      res.json([songData]);
    } else {
      throw new Error('Failed to fetch data from the website');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
