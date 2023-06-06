import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

interface School {
  schoolId: string;
  schoolName: string;
}

interface FormData {
  schoolId: string | null;
  schoolName: string | null;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const ManageSchools: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    schoolId: null,
    schoolName: null,
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch existing schools data from the server
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch("https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"); // fetch db
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch schools");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSchool = async () => {
    if (!formData.schoolName) {
      setErrorMessage("School name is required");
      return;
    }

    try {
      const response = await fetch("https://functions.yandexcloud.net/d4e17dlips5imntja58l", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage("School added successfully");
        setFormData({ schoolId: null, schoolName: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchSchools(); // Refresh the schools data after adding a new school
      } else {
        setErrorMessage("Failed to add school");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to add school");
    }
  };

  const editSchool = async (school: School) => {
    setFormData({ schoolId: school.schoolId, schoolName: school.schoolName });
  };

  const updateSchool = async () => {
    if (!formData.schoolId || !formData.schoolName) {
      setErrorMessage("School ID and name are required");
      return;
    }

    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSuccessMessage("School updated successfully");
        setFormData({ schoolId: null, schoolName: null });
        fetchSchools(); // Refresh the schools data after updating the school
      } else {
        setErrorMessage("Failed to update school");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update school");
    }
  };

  const deleteSchool = async (school: School) => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(school),
        }
      );

      if (response.ok) {
        setSuccessMessage("School deleted successfully");
        fetchSchools(); // Refresh the schools data after deleting the school
      } else {
        setErrorMessage("Failed to delete school");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to delete school");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>School Form</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form>
        <InputField
          fullWidth
          label="School Name"
          id="schoolName"
          name="schoolName"
          value={formData.schoolName || ""}
          onChange={handleChange}
        />
        <br />
        <Button variant="contained" onClick={addSchool}>
          Add School
        </Button>
        <Button variant="contained" onClick={updateSchool}>
          Update School
        </Button>
      </form>
      <br />
      <h3>Schools</h3>
      {schools.map((school) => (
        <div key={school.schoolId}>
          <p>{school.schoolName}</p>
          <Button variant="contained" onClick={() => editSchool(school)}>
            Edit
          </Button>
          <Button variant="contained" onClick={() => deleteSchool(school)}>
            Delete
          </Button>
          <br />
        </div>
      ))}
    </Box>
  );
};

export default ManageSchools;
