import React, { useState, useRef } from "react";
import { TextField, Button, Box, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

interface Task {
  name: string;
  archive: string;
}

interface FormData {
  name: string | null;
  tasks?: Task[] | null;
  year: number | null;
}

const InputField = styled(TextField)({
  marginBottom: "1rem",
});

const InsertContest: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: null,
    tasks: undefined,
    year: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...(formData.tasks || [])];
    updatedTasks[index] = { ...(updatedTasks[index] || {}), [field]: value };
    setFormData({ ...formData, tasks: updatedTasks });
  };

  const addTask = () => {
    const updatedTasks = [...(formData.tasks || []), { name: "", archive: "" }];
    setFormData({ ...formData, tasks: updatedTasks });
  };

  const removeTask = (index: number) => {
    const updatedTasks = [...(formData.tasks || [])];
    updatedTasks.splice(index, 1);
    setFormData({ ...formData, tasks: updatedTasks });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.year) {
      setErrorMessage("Please enter a valid name and year");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        tasks: JSON.stringify(formData.tasks),
        year: formData.year,
      };

      const response = await fetch(
        "https://functions.yandexcloud.net/d4e6fb7lqegfcrenni7b", // insertContest function
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log(data);
      setSuccessMessage("Contest added successfully");
      setFormData({ name: "", tasks: undefined, year: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error adding contest");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Insert Contest</h2>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          fullWidth
          label="Name"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <br />
        <InputField
          fullWidth
          label="Year"
          id="year"
          name="year"
          type="number"
          value={formData.year || ""}
          onChange={handleChange}
        />
        <br />
        <InputLabel htmlFor="tasks">Contest Tasks:</InputLabel>
        <br />
        {(formData.tasks || []).map((task, index) => (
          <div key={index}>
            <InputField
              fullWidth
              label={`Task ${index + 1} Name`}
              name="name"
              value={task.name}
              onChange={(e) => handleTaskChange(index, "name", e.target.value)}
            />
            <InputField
              fullWidth
              label={`Task ${index + 1} Archive`}
              name="archive"
              value={task.archive}
              onChange={(e) => handleTaskChange(index, "archive", e.target.value)}
            />
            <Button variant="contained" onClick={() => removeTask(index)}>
              Remove Task
            </Button>
            <br />
          </div>
        ))}
        <Button variant="contained" onClick={addTask}>
          Add Task
        </Button>
        <br />
        <br />
        <Button variant="contained" type="submit">
          Add Contest
        </Button>
      </form>
    </Box>
  );
};

export default InsertContest;
