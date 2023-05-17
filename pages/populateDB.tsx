import { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';

const PopulateDB = () => {
  const [name, setName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [contestName, setContestName] = useState('');
  const [awardName, setAwardName] = useState('');

  const cloudFunctionURL = 'https://functions.yandexcloud.net/d4ec4hjcaoaf6ccdl8n0';

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch(cloudFunctionURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, countryName, schoolName, contestName, awardName }),
    });

    if (response.ok) {
      alert('Participant added successfully');
    } else {
      alert('Error adding participant');
    }
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Add Participant
        </Typography>

        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Country Name"
          value={countryName}
          onChange={(event) => setCountryName(event.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="School Name"
          value={schoolName}
          onChange={(event) => setSchoolName(event.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Contest Name"
          value={contestName}
          onChange={(event) => setContestName(event.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Award Name"
          value={awardName}
          onChange={(event) => setAwardName(event.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default PopulateDB;