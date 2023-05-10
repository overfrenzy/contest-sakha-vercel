import { useState } from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
} from "@mui/material";

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    taskName: "",
    taskValue: "",
    taskSolved: false,
    placementTime: "",
    placementTotal: "",
    countryName: "",
    schoolName: "",
    contestName: "",
    contestYear: "",
    contestTasksNumber: "",
    resultGrade: "",
    resultTry: "",
    resultTime: "",
    awardName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Show the loading indicator
    setSubmitting(true);

    try {
      // Submit the form data to the serverless function
      const response = await fetch("/api/form-submit", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Get the response message
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while inserting data");
    } finally {
      // Hide the loading indicator
      setSubmitting(false);

      // Clear the form data
      setFormData({
        name: "",
        taskName: "",
        taskValue: "",
        taskSolved: false,
        placementTime: "",
        placementTotal: "",
        countryName: "",
        schoolName: "",
        contestName: "",
        contestYear: "",
        contestTasksNumber: "",
        resultGrade: "",
        resultTry: "",
        resultTime: "",
        awardName: "",
      });
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Task Name"
          type="text"
          name="taskName"
          value={formData.taskName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Task Value"
          type="number"
          name="taskValue"
          value={formData.taskValue}
          onChange={handleChange}
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              name="taskSolved"
              checked={formData.taskSolved}
              onChange={(event) =>
                setFormData({ ...formData, taskSolved: event.target.checked })
              }
            />
          }
          label="Task Solved"
        />
        <TextField
          label="Placement Time"
          type="text"
          name="placementTime"
          value={formData.placementTime}
          onChange={handleChange}
          required
        />
        <TextField
          label="Placement Total"
          type="text"
          name="placementTotal"
          value={formData.placementTotal}
          onChange={handleChange}
          required
        />
        <TextField
          label="Country Name"
          type="text"
          name="countryName"
          value={formData.countryName}
          onChange={handleChange}
          required
        />
        <TextField
          label="School Name"
          type="text"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Contest Name"
          type="text"
          name="contestName"
          value={formData.contestName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Contest Year"
          type="number"
          name="contestYear"
          value={formData.contestYear}
          onChange={handleChange}
          required
        />
        <TextField
          label="Contest Tasks Number"
          type="number"
          name="contestTasksNumber"
          value={formData.contestTasksNumber}
          onChange={handleChange}
          required
        />
        <TextField
          label="Result Grade"
          type="text"
          name="resultGrade"
          value={formData.resultGrade}
          onChange={handleChange}
          required
        />
        <TextField
          label="Result Try"
          type="text"
          name="resultTry"
          value={formData.resultTry}
          onChange={handleChange}
          required
        />
        <TextField
          label="Result Time"
          type="text"
          name="resultTime"
          value={formData.resultTime}
          onChange={handleChange}
          required
        />
        <TextField
          label="Award Name"
          type="text"
          name="awardName"
          value={formData.awardName}
          onChange={handleChange}
          required
        />
        <Button type="submit" disabled={submitting} variant="contained">
          {submitting ? "Submitting..." : "Submit"}
        </Button>
        {message && <p>{message}</p>}
      </Box>
    </form>
  );
}
