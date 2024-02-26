// .github/scripts/notifyRanking.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fetchRanking(trainerName) {
  try {
    // ランキングマッチリストAPIから最新のシーズン情報を取得
    const response = await fetch('https://api.battle.pokemon-home.com/tt/cbd/competition/rankmatch/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Authorization': 'Bearer',
        'Origin': 'https://resource.pokemon-home.com',
        'Referer': 'https://resource.pokemon-home.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      },
      body: JSON.stringify({ soft: "Sc" })
    });

    if (!response.ok) {
      throw new Error('ランキングマッチリストの取得に失敗しました。');
    }

    const data = await response.json();
    const latestData = data.list[Object.keys(data.list).pop()];
    const rankingData = latestData[Object.keys(latestData)[0]];
    const cId = rankingData.cId;
    const rst = rankingData.rst;
    const ts1 = rankingData.ts1;

    // 最新のシーズン情報をもとに、特定のトレーナーのランキングデータを取得
    const rankingResponse = await fetch(`https://resource.pokemon-home.com/battledata/ranking/scvi/${cId}/${rst}/${ts1}/traner-1`);
    if (!rankingResponse.ok) {
      throw new Error('トレーナーのランキングデータの取得に失敗しました。');
    }

    const rankingResData = await rankingResponse.json();
    // トレーナー名で検索してランキング情報を見つける
    const trainerRanking = rankingResData.find(entry => entry.name === trainerName);

    if (!trainerRanking) {
      throw new Error(`${trainerName} のランキング情報が見つかりません。`);
    }

    return trainerRanking.rank; // トレーナーの順位を返す
  } catch (error) {
    console.error('Error fetching ranking:', error);
    throw error;
  }
}


async function notifyRanking() {
  const { data: users, error } = await supabase
    .from('rt_users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  for (const user of users) {
    const ranking = await fetchRanking(user.trainer_name);
    const message = `${user.trainer_name}さんの現在の順位は${ranking}位です`;

    await fetch(user.slack_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });
  }
}

notifyRanking().catch(console.error);
