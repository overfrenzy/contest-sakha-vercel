import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  countryName: string;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertCountry: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    countryName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...  formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4eobhqsfevgncpf1fj4", //insertCountry function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryName: formData.countryName,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      setSuccessMessage("Country added successfully");
      setFormData({ countryName: "" });
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding country");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Add Country</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          fullWidth
          label="Country Name"
          id="countryName"
          name="countryName"
          value={formData.countryName}
          onChange={handleChange}
        />
        <Box sx={{ display: "block", mt: 2 }}>
          <Button variant="contained" type="submit">
            Add Country
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InsertCountry;