import { useState } from "react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    taskName: "",
    taskValue: "",
    taskSolved: false,
    placementTime: "",
    placementTotal: "",
    countryName: "",
    schoolName: "",
    contestName: "",
    contestYear: "",
    contestTasksNumber: "",
    resultGrade: "",
    resultTry: "",
    resultTime: "",
    awardName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Show the loading indicator
    setSubmitting(true);

    try {
      // Submit the form data to the serverless function
      const response = await fetch("/api/form-submit", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Get the response message
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while inserting data");
    } finally {
      // Hide the loading indicator
      setSubmitting(false);

      // Clear the form data
      setFormData({
        name: "",
        taskName: "",
        taskValue: "",
        taskSolved: false,
        placementTime: "",
        placementTotal: "",
        countryName: "",
        schoolName: "",
        contestName: "",
        contestYear: "",
        contestTasksNumber: "",
        resultGrade: "",
        resultTry: "",
        resultTime: "",
        awardName: "",
      });
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Task Name:
        <input
          type="text"
          name="taskName"
          value={formData.taskName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Task Value:
        <input
          type="number"
          name="taskValue"
          value={formData.taskValue}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Task Solved:
        <input
          type="checkbox"
          name="taskSolved"
          checked={formData.taskSolved}
          onChange={(event) =>
            setFormData({ ...formData, taskSolved: event.target.checked })
          }
        />
      </label>
      <br />
      <label>
        Placement Time:
        <input
          type="text"
          name="placementTime"
          value={formData.placementTime}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Placement Total:
        <input
          type="text"
          name="placementTotal"
          value={formData.placementTotal}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Country Name:
        <input
          type="text"
          name="countryName"
          value={formData.countryName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        School Name:
        <input
          type="text"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Contest Name:
        <input
          type="text"
          name="contestName"
          value={formData.contestName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Contest Year:
        <input
          type="number"
          name="contestYear"
          value={formData.contestYear}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Contest Tasks Number:
        <input
          type="number"
          name="contestTasksNumber"
          value={formData.contestTasksNumber}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Result Grade:
        <input
          type="text"
          name="resultGrade"
          value={formData.resultGrade}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Result Try:
        <input
          type="text"
          name="resultTry"
          value={formData.resultTry}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Result Time:
        <input
          type="text"
          name="resultTime"
          value={formData.resultTime}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Award Name:
        <input
          type="text"
          name="awardName"
          value={formData.awardName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
      <br />
      {message && <p>{message}</p>}
    </form>
  );
}
