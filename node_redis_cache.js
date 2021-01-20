const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
const app = express();

// Set response
function setResponse(data) {
  return JSON.parse(JSON.stringify(data));
}

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    console.log('Fetching Data...');
    const response = await fetch(`https://opentdb.com/api.php?amount=49`);
    const data = await response.json();
    // Set data to Redis
    client.setex("questions", 3600, JSON.stringify(data));

    res.send(setResponse(data));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  client.get("questions", (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(data));
    } else {
      next();
    }
  });
}

app.get('/getJson', cache, getRepos);

app.listen(5000, () => {
  console.log(`App listening on port ${PORT}`);
});
