import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface FormData {
  contestId: string | null;
  name: string | null;
  tasks: object | null;
  year: number | null;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const ManageContests: React.FC = () => {
  const [contests, setContests] = useState([]);
  const [formData, setFormData] = useState<FormData>({
    contestId: null,
    name: null,
    tasks: null,
    year: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"
      );
      const data = await response.json();
      setContests(data.contests);
    } catch (error) {
      console.error(error);
    }
  };

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
      setSuccessMessage("Contest added successfully");
      setFormData({ contestId: null, name: null, tasks: null, year: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding contest");
    }
  };
  

  const handleEdit = (contest: any) => {
    setFormData({
      contestId: contest.contest_id,
      name: contest.name,
      tasks: contest.tasks,
      year: contest.year,
    });
  };  

  const handleDelete = async (contestId: string) => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b", //insertContest function
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contestId }),
        }
      );
      const data = await response.json();
      setSuccessMessage("Contest deleted successfully");
      fetchContests();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error deleting contest");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Manage Contests</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        {/* ...existing form fields... */}
        <Button variant="contained" type="submit">
          {formData.contestId ? "Update Contest" : "Add Contest"}
        </Button>
      </form>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((contest: any) => (
              <TableRow key={contest.contest_id}>
                <TableCell>{contest.name}</TableCell>
                <TableCell>{contest.year}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(contest)}>Edit</Button>
                  <Button onClick={() => handleDelete(contest.contest_id)}>
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

export default ManageContests;
