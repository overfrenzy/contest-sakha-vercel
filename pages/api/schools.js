import fetch from 'node-fetch';

export default async (req, res) => {
  const data = await fetch('https://your-cloud-function-url/', {
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await data.json();
  const schools = json.schools;

  res.status(200).json(schools);
};
