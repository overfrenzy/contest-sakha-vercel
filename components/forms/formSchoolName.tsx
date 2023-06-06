import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertSchool: React.FC = () => {
  const [schoolName, setSchoolName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchoolName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!schoolName) {
      console.error("School name is required");
      return;
    }

    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l", // insertSchool function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school: { schoolName } }),
        }
      );

      if (response.ok) {
        console.log("School name added successfully");
        setSchoolName("");
      } else {
        console.error("Failed to add school name");
      }
    } catch (error) {
      console.error("Error adding school name", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert School</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          fullWidth
          label="School Name"
          value={schoolName}
          onChange={handleInputChange}
        />
        <Button variant="contained" type="submit">
          Add School
        </Button>
      </form>
    </Box>
  );
};

export default InsertSchool;
