import React, { useState } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  name: string;
  countryName: string;
  schoolName: string;
  contestName: string;
  awardName: string;
  year: number | "";
  tasks: string;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertParticipant: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    countryName: "",
    schoolName: "",
    contestName: "",
    awardName: "",
    year: "",
    tasks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "year") {
      const value = parseInt(e.target.value);
      if (Number.isInteger(value)) {
        setFormData({ ...formData, [e.target.name]: value });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setFormData({ ...formData, tasks: event.target.result as string });
      }
    };
    if (e.target.files && e.target.files.length > 0) {
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4ec4hjcaoaf6ccdl8n0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            countryName: formData.countryName,
            schoolName: formData.schoolName,
            contestName: formData.contestName,
            awardName: formData.awardName,
            year: formData.year,
            tasks: JSON.parse(formData.tasks),
          }),
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert Participant</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <InputField
          label="Country Name"
          id="countryName"
          name="countryName"
          value={formData.countryName}
          onChange={handleChange}
          fullWidth
        />
        <InputField
          label="School Name"
          id="schoolName"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          fullWidth
        />
        <InputField
          label="Contest Name"
          id="contestName"
          name="contestName"
          value={formData.contestName}
          onChange={handleChange}
          fullWidth
        />
        <InputField
          label="Year"
          id="year"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          fullWidth
        />
        <InputField
          label="Award Name"
          id="awardName"
          name="awardName"
          value={formData.awardName}
          onChange={handleChange}
          fullWidth
        />
        <InputLabel htmlFor="tasks" sx={{ mb: 1 }}>
          Contest Tasks:
        </InputLabel>
        <InputField
          type="file"
          id="tasks"
          name="tasks"
          onChange={handleFileChange}
          fullWidth
        />

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default InsertParticipant;
