import { useState } from "react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    country: "",
    school: "",
    participation: "",
    award: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Show the loading indicator
    setSubmitting(true);

    try {
      // Submit the form data to the serverless function
      const response = await fetch("/api/submit-form", {
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
        id: "",
        name: "",
        country: "",
        school: "",
        participation: "",
        award: "",
      });
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Id:
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
        />
      </label>
      <br />
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
        Country:
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        School:
        <input
          type="text"
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Participation:
        <input
          type="text"
          name="participation"
          value={formData.participation}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Award:
        <input
          type="text"
          name="award"
          value={formData.award}
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
