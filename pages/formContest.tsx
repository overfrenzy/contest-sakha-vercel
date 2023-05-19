import React, { useState } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  name: string | null;
  tasks: object | null;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setFormData({
          ...formData,
          tasks: JSON.parse(event.target.result as string),
        });
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
        "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b", //insertContest function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            tasks: formData.tasks,
            year: formData.year,
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
      <h2>Insert Contest</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Name"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <br />
        <InputField
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
          type="file"
          id="tasks"
          name="tasks"
          onChange={handleFileChange}
        />
        <br />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default InsertContest;
