import React, { useState } from "react";
import {
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Input,
} from "@mui/material";

export default function DatabaseForm() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [school, setSchool] = useState("");
  const [contest, setContest] = useState({ name: "", year: "", tasks: [] });
  const [award, setAward] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('https://functions.yandexcloud.net/d4evp65g6njl3eb4midb', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, country, school, contest, award }),
    });

    const result = await response.json();
    console.log(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const tasks = JSON.parse(event.target.result as string);
          setContest({ ...contest, tasks });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="School"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contest Name"
          value={contest.name}
          onChange={(e) => setContest({ ...contest, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contest Year"
          type="number"
          value={contest.year}
          onChange={(e) => setContest({ ...contest, year: e.target.value })}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel htmlFor="contestTasks">Contest Tasks (JSON)</InputLabel>
          <Input
            id="contestTasks"
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: "application/json" }}
          />
        </FormControl>
        <TextField
          label="Award"
          value={award}
          onChange={(e) => setAward(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Container>
  );
}
