import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Grid } from '@mui/material';

export default function DatabaseForm() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [school, setSchool] = useState("");
  const [contestName, setContestName] = useState("");
  const [contestYear, setContestYear] = useState("");
  const [award, setAward] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("/api/form-submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        country,
        school,
        contest: {
          name: contestName,
          year: parseInt(contestYear),
        },
        award,
      }),
    });

    if (response.ok) {
      alert("Participant added successfully");
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="School"
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Contest Name"
            value={contestName}
            onChange={(event) => setContestName(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Contest Year"
            type="number"
            value={contestYear}
            onChange={(event) => setContestYear(event.target.value)}
            inputProps={{
              step: 1,
              pattern: "\\d*",
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Award"
            value={award}
            onChange={(event) => setAward(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" type="submit" fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
  
}
