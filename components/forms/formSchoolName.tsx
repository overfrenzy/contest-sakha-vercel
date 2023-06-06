import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertSchool: React.FC = () => {
  const [schoolNames, setSchoolNames] = useState<string[]>([""]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
    const { value } = e.target;
    setSchoolNames((prevSchoolNames) => {
      const updatedSchoolNames = [...prevSchoolNames];
      updatedSchoolNames[index] = value;
      return updatedSchoolNames;
    });
  };

  const addInputLine = () => {
    setSchoolNames((prevSchoolNames) => [...prevSchoolNames, ""]);
  };

  const removeInputLine = (index: number) => {
    setSchoolNames((prevSchoolNames) => {
      const updatedSchoolNames = [...prevSchoolNames];
      updatedSchoolNames.splice(index, 1);
      return updatedSchoolNames;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredSchoolNames = schoolNames.filter(Boolean); // Remove empty values

    if (filteredSchoolNames.length === 0) {
      console.error("School name is required");
      return;
    }

    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l", // insertSchool function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school: { schoolName: filteredSchoolNames } }),
        }
      );

      if (response.ok) {
        console.log("School names added successfully");
        setSchoolNames([""]);
      } else {
        console.error("Failed to add school names");
      }
    } catch (error) {
      console.error("Error adding school names", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert School</h2>
      <form onSubmit={handleSubmit}>
        {schoolNames.map((schoolName, index) => (
          <InputField
            key={index}
            fullWidth
            label="School Name"
            value={schoolName}
            onChange={(e) => handleInputChange(e, index)}
          />
        ))}
        <Button variant="contained" onClick={addInputLine}>
          Add School
        </Button>
        {schoolNames.length > 1 && (
          <Button variant="contained" onClick={() => removeInputLine(schoolNames.length - 1)}>
            Remove School
          </Button>
        )}
        <Button variant="contained" type="submit">
          Add Schools
        </Button>
      </form>
    </Box>
  );
};

export default InsertSchool;
