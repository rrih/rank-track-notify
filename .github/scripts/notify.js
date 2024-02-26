const axios = require('axios');

const notify = async () => {
  try {
    const res = await axios.post(
      'https://rank-battle-tracker.vercel.app/api/notify',
      {
        message: 'Hello, World!'
      }
    );
    const data = await res.data;
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

notify();