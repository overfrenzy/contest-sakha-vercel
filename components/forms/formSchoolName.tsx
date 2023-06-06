import React, { useState, useRef } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertSchool: React.FC = () => {
  const [schools, setSchools] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSchool = () => {
    setSchools([...schools, ""]);
  };

  const handleRemoveSchool = (index: number) => {
    const updatedSchools = [...schools];
    updatedSchools.splice(index, 1);
    setSchools(updatedSchools);
  };

  const handleChangeSchool = (index: number, value: string) => {
    const updatedSchools = [...schools];
    updatedSchools[index] = value;
    setSchools(updatedSchools);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (schools.length === 0) {
      setErrorMessage("Please enter at least one school");
      return;
    }
    try {
      const payload = {
        schools: schools.map((schoolName) => ({ schoolName })),
      };
  
      const response = await fetch("https://functions.yandexcloud.net/d4e17dlips5imntja58l", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log(data);
      setSuccessMessage("Schools added successfully");
      setSchools([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding schools");
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert Schools</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        {schools.map((school, index) => (
          <div key={index}>
            <InputLabel htmlFor={`schoolname_${index}`}>School Name:</InputLabel>
            <InputField
              fullWidth
              multiline
              rows={4}
              label={`School Name ${index + 1}`}
              id={`schoolname_${index}`}
              value={school}
              onChange={(e) => handleChangeSchool(index, e.target.value)}
            />
            <Button variant="contained" onClick={() => handleRemoveSchool(index)}>
              Remove School
            </Button>
            <br />
          </div>
        ))}
        <Button variant="contained" onClick={handleAddSchool}>
          Add School
        </Button>
        <br />
        <br />
        <Button variant="contained" type="submit">
          Add Schools
        </Button>
      </form>
    </Box>
  );
};

export default InsertSchool;
