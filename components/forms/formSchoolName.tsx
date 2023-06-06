import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  schoolName: string;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertSchoolName: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    schoolName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l", //insertSchoolName function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolName: formData.schoolName,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      setSuccessMessage("School name added successfully");
      setFormData({ schoolName: "" });
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding school name");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert School Name</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          fullWidth
          label="School Name"
          id="schoolName"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
        />
        <Box sx={{ display: "block", mt: 2 }}>
          <Button variant="contained" type="submit">
            Add School
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InsertSchoolName;