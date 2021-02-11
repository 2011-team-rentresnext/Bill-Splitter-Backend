const fetch = require('node-fetch');

/*
- get base64 from frontend
- send base64 to cloud vision -> receive receipt data
- send receipt to function -> function parses data
- use data to create new receipt object
	- use data to create new item objects
- res.json back receipt and items
*/

const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`;

async function callGoogleVisionAsync(image) {
  console.log('inside callGoogleVision');
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await fetch(VISION_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  return parseReceiptData(result.responses[0].textAnnotations[0].description);
}

function getCents(str) {
  return parseFloat(str.slice(1)) * 100;
}

function parseReceiptData(receiptText) {
  const arr = receiptText.split('\n');
  const names = [];
  const prices = [];
  const items = [];
  arr.forEach((element) => {
    if (element[0] === '$') prices.push(getCents(element));
    else if (element[1] && element[1] === element[1].toLowerCase())
      names.push(element);
  });
  names.forEach((name, i) => items.push({ name, price: prices[i] }));
  total = Math.max(...prices);

  return { items, total };
}

module.exports = callGoogleVisionAsync;
