import fetch from 'node-fetch';

export default async (req, res) => {
  const data = await fetch('https://your-cloud-function-url/', {
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await data.json();
  const participations = json.participations;

  res.status(200).json(participations);
};
