import React, { useState, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  countryId: string;
  countryName: string;
}

interface Country {
  country_id: string;
  name: string;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const ManageCountries: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState<FormData>({
    countryId: "",
    countryName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f" // fetch-db function
      );
      const data = await response.json();
      setCountries(data.countries);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let response;
      if (formData.countryId) {
        response = await fetch(
          "https://functions.yandexcloud.net/d4eobhqsfevgncpf1fj4", // upsertCountry function
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              countryId: formData.countryId,
              countryName: formData.countryName,
            }),
          }
        );
      } else {
        response = await fetch(
          "https://functions.yandexcloud.net/d4eobhqsfevgncpf1fj4", // insertCountry function
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              countryName: formData.countryName,
            }),
          }
        );
      }
      const data = await response.json();
      console.log(data);
      setSuccessMessage(
        formData.countryId
          ? "Country updated successfully"
          : "Country added successfully"
      );
      setFormData({ countryId: "", countryName: "" });
      fetchCountries();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding/editing country");
    }
  };

  const handleEdit = (country: Country) => {
    setFormData({ countryId: country.country_id, countryName: country.name });
  };

  const handleDelete = async (countryId: string) => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4eobhqsfevgncpf1fj4", // deleteCountry function
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryId }),
        }
      );
      const data = await response.json();
      setSuccessMessage("Country deleted successfully");
      fetchCountries();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting country");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Manage Country</h2>
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
            {formData.countryId ? "Update Country" : "Add Country"}
          </Button>
        </Box>
      </form>
      <h2>Country List</h2>
      <ul>
        {countries.map((country) => (
          <li key={country.country_id}>
            {country.name}
            <Button variant="contained" onClick={() => handleEdit(country)}>
              Edit
            </Button>
            <Button
              variant="contained"
              onClick={() => handleDelete(country.country_id)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default ManageCountries;
