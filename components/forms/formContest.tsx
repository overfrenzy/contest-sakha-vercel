import React, { useState, useRef } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  name: string | null;
  tasks: string | null; 
  year: number | null;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertContest: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: null,
    tasks: null,
    year: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData({
            ...formData,
            tasks: event.target.result as string,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b", // insertContest function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            tasks: JSON.parse(formData.tasks || ""),
            year: formData.year,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      setSuccessMessage("Contest added successfully");
      setFormData({ name: null, tasks: null, year: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding contest");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert Contest</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          fullWidth
          label="Name"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <br />
        <InputField
          fullWidth
          label="Year"
          id="year"
          name="year"
          type="number"
          value={formData.year || ""}
          onChange={handleChange}
        />
        <br />
        <InputLabel htmlFor="tasks">Contest Tasks:</InputLabel>
        <br />
        <InputField
          fullWidth
          label="Tasks"
          id="tasks"
          name="tasks"
          multiline
          rows={4}
          value={formData.tasks || ""}
          onChange={handleChange}
        />
        <br />
        <Button variant="contained" type="submit">
          Add Contest
        </Button>
      </form>
    </Box>
  );
};

export default InsertContest;
