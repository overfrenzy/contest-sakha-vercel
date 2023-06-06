import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface School {
  school_id: string;
  schoolname: object;
}

interface FormData {
  schoolName: string;
}

const ManageSchools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<FormData>({
    schoolName: "",
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"
      );
      const data = await response.json();
      setSchools(data.schools);
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
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e17dlips5imntja58l", // Insert school function endpoint
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolName: JSON.parse(formData.schoolName),
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      setFormData({ schoolName: "" });
      fetchSchools();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async (school: School) => {
    setFormData({
      schoolName: JSON.stringify(school.schoolname),
    });
  };

  const handleDelete = async (schoolId: string) => {
    try {
      const response = await fetch(
        `https://functions.yandexcloud.net/d4e17dlips5imntja58l`, // Delete school function endpoint
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      console.log(data);
      fetchSchools();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Manage Schools</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextField
          label="School Name"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          required
        />
        <Button variant="contained" type="submit">
          Add School
        </Button>
      </form>
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School ID</TableCell>
              <TableCell>School Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.school_id}>
                <TableCell>{school.school_id}</TableCell>
                <TableCell>{JSON.stringify(school.schoolname)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(school)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(school.school_id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageSchools;
