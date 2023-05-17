import fetch from 'node-fetch';

export default async (req, res) => {
  const data = await fetch('https://functions.yandexcloud.net/d4e8s3vflh5b7h6dgsdn', {
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await data.json();
  const awards = json.awards;

  res.status(200).json(awards);
};
