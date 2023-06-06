import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Grid,
  Box,
} from "@mui/material";

interface Data {
  countries: { country_id: string; name: string }[];
  schools: { school_id: string; schoolname: { name: string } }[]; // updated this line
  participations: { participation_id: string; contest_id: string }[];
  awards: { award_id: string; name: string }[];
  contests: { contest_id: string; name: string }[];
}

function InsertParticipant() {
  const [data, setData] = useState<Data>({
    countries: [],
    schools: [],
    participations: [],
    awards: [],
    contests: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [participantName, setParticipantName] = useState("");

  const [selectedContest, setSelectedContest] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [tasks1, setTasks1] = useState("");
  const [tasksArray1, setTasksArray1] = useState<string[]>([]);
  const [tasks2, setTasks2] = useState("");
  const [tasksArray2, setTasksArray2] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [tryCount, setTryCount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  async function fetchData() {
    const response = await fetch(
      "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f", //fetch-db function
      {
      method: "GET",
      }
    );
    const data = await response.json();
    
    // Parse schoolname from string to object
    data.schools = data.schools.map((school: any) => ({
      ...school,
      schoolname: JSON.parse(school.schoolname),
    }));
    
    setData(data);
    setLoading(false);
  }

  const handleTasksChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTasks1(e.target.value);
    setTasksArray1(e.target.value.split(",").map((task) => task.trim()));
  };

  const handleTasksChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTasks2(e.target.value);
    setTasksArray2(e.target.value.split(",").map((task) => task.trim()));
  };

  async function addParticipant() {
    try {
      const tasksDoneJson = JSON.stringify({
        problems1: tasksArray1,
        problems2: tasksArray2,
      }); // convert tasksArray1 and tasksArray2 to JSON
      const response = await fetch(
        "https://functions.yandexcloud.net/d4eqfmirprh225fg72au",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: selectedCountry,
            school: selectedSchool,
            name: participantName,
            contest: selectedContest,
            award: selectedAward,
            tasksDone: tasksDoneJson, // send the JSON object
            time: time,
            tryCount: tryCount,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Participant has been added successfully.");
        clearForm();
      } else {
        setErrorMessage("An error occurred while adding the participant.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while adding the participant.");
    }
  }

  const clearForm = () => {
    setSelectedCountry("");
    setSelectedSchool("");
    setParticipantName("");
    setSelectedContest("");
    setSelectedAward("");
    setTasks1("");
    setTasksArray1([]);
    setTasks2("");
    setTasksArray2([]);
    setTime("");
    setTryCount("");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Typography variant="h4">Add Participant and Participation</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Participant</Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {data.countries &&
                data.countries.map((country) => (
                  <MenuItem key={country.country_id} value={country.country_id}>
                    {country.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button onClick={refreshData}>Refresh</Button>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>School</InputLabel>
            <Select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              {data.schools &&
                data.schools.map((school) => (
                  <MenuItem key={school.school_id} value={school.school_id}>
                    {school.schoolname.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button onClick={refreshData}>Refresh</Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Participant Name"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Participation</Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Contest</InputLabel>
            <Select
              value={selectedContest}
              onChange={(e) => setSelectedContest(e.target.value)}
            >
              {data.contests &&
                data.contests.map((contest) => (
                  <MenuItem key={contest.contest_id} value={contest.contest_id}>
                    {contest.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button onClick={refreshData}>Refresh</Button>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Award</InputLabel>
            <Select
              value={selectedAward}
              onChange={(e) => setSelectedAward(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {data.awards &&
                data.awards.map((award) => (
                  <MenuItem key={award.award_id} value={award.award_id}>
                    {award.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button onClick={refreshData}>Refresh</Button>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Tasks Day 1 (comma separated)"
            value={tasks1}
            onChange={handleTasksChange1}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Tasks Day 2 (comma separated)"
            value={tasks2}
            onChange={handleTasksChange2}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            label="Time (optional)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Try Count (optional)"
            variant="outlined"
            fullWidth
            value={tryCount}
            onChange={(e) => setTryCount(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color="primary" onClick={addParticipant}>
            Add Participant
          </Button>
        </Grid>
        <Grid item xs={12}>
          {successMessage && (
            <Box mt={2}>
              <Typography variant="subtitle1" color="primary">
                {successMessage}
              </Typography>
            </Box>
          )}
          {errorMessage && (
            <Box mt={2}>
              <Typography variant="subtitle1" color="error">
                {errorMessage}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
export default InsertParticipant;
