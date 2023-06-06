import React, { useState, useEffect, useRef } from "react";
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
import { styled } from "@mui/material/styles";

interface FormData {
  contestId: string | null;
  name: string | null;
  tasks: string | null;
  year: number | null;
}

interface Contest {
  contest_id: string;
  name: string;
  tasks: object;
  year: number;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const ManageContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
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
        "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f" // fetch-db function
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b"; // UpdateContest function with contest ID parameter
  
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          tasks: JSON.parse(formData.tasks || ""),
          year: formData.year,
        }),
      });
  
      const data = await response.json();
      console.log(data);
  
      setSuccessMessage("Contest updated successfully");
      setFormData({ contestId: null, name: null, tasks: null, year: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  
      fetchContests();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error updating contest");
    }
  };
  

  const handleEdit = async (contest: Contest) => {
    setFormData({
      contestId: contest.contest_id,
      name: contest.name,
      tasks: JSON.stringify(contest.tasks),
      year: contest.year,
    });
  };

  const handleDelete = async (contestId: string) => {
    try {
      const response = await fetch(
        "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b", // deleteContest function
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contestId }),
        }
      );
      const data = await response.json();
      console.log(data);
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
        <TextField
          label="Name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Year"
          name="year"
          type="number"
          value={formData.year || ""}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Tasks"
          name="tasks"
          value={formData.tasks || ""}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />
        <Button variant="contained" type="submit">
          Add Contest
        </Button>
      </form>
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((contest) => (
              <TableRow key={contest.contest_id}>
                <TableCell>{contest.name}</TableCell>
                <TableCell>{contest.year}</TableCell>
                <TableCell>{JSON.stringify(contest.tasks)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(contest)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(contest.contest_id)}
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

export default ManageContests;
