const fetch = require('node-fetch');
require('dotenv').config();

async function main() {
  try {
    // POSTリクエストを送信する
    await fetch(`https://rank-battle-tracker.vercel.app/api/ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
