import { useState } from "react";
import { TextField, Button, Box, Grid, Typography } from "@mui/material";

export default function DatabaseForm() {
  const [name, setName] = useState("");
  const [placementTime, setPlacementTime] = useState("");
  const [placementTotal, setPlacementTotal] = useState("");
  const [countryName, setCountryName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [awardName, setAwardName] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Submitting...");

    try {
      const response = await fetch("/api/form-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          placementTime,
          placementTotal,
          countryName,
          schoolName,
          awardName,
        }),
      });

      if (response.ok) {
        setStatus("Submission successful!");
        setName("");
        setPlacementTime("");
        setPlacementTotal("");
        setCountryName("");
        setSchoolName("");
        setAwardName("");
      } else {
        setStatus("Submission failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Submission failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Placement Time"
            value={placementTime}
            onChange={(event) => {
              const numericValue = event.target.value.replace(/\D/g, "");
              setPlacementTime(numericValue);
            }}
          />
        </Grid>

        <Grid item>
          <TextField
            label="Placement Total"
            value={placementTotal}
            onChange={(event) => {
              const numericValue = event.target.value.replace(/\D/g, "");
              setPlacementTotal(numericValue);
            }}
          />
        </Grid>

        <Grid item>
          <TextField
            label="Country"
            value={countryName}
            onChange={(event) => setCountryName(event.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="School Name"
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Award"
            value={awardName}
            onChange={(event) => setAwardName(event.target.value)}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </Grid>
      </Grid>
      {status && (
        <Box mt={2}>
          <Typography>{status}</Typography>
        </Box>
      )}
    </form>
  );
}
