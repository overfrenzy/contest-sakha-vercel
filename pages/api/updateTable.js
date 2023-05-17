import fetch from 'node-fetch';

const handler = async (req, res) => {
    if (req.method === 'POST') {
      const { award, country, school, participation, contest, schoolname } = req.body;

    const response = await fetch('https://functions.yandexcloud.net/d4eqnrip9actlted2np7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ award, country, school, participation, contest, schoolname }),
    });


    if (response.ok) {
      res.status(200).json({ message: 'Tables updated successfully.' });
    } else {
      res.status(500).json({ message: 'Error updating tables.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default handler;
