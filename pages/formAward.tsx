import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  awardName: string;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertAward: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    awardName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4esum4t3768sp096apb", //insertAward function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            awardName: formData.awardName,
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
      <h2>Insert Award</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Award Name"
          id="awardName"
          name="awardName"
          value={formData.awardName}
          onChange={handleChange}
        />
        <Box sx={{ display: "block", mt: 2 }}>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InsertAward;
