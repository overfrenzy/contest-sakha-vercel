import { useState, useEffect } from "react";

export default function DbForm() {
  const [responseMessage, setResponseMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [schools, setSchools] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [awards, setAwards] = useState([]);
  const [contests, setContests] = useState([]);
  const [schoolnames, setSchoolNames] = useState([]);

  const fetchData = async (type) => {
    const response = await fetch(`/api/${type}`);
    const data = await response.json();
    return data;
  };

  const updateDropdowns = async () => {
    const [countries, schools, participations, awards, contests, schoolnames] =
      await Promise.all([
        fetchData("countries"),
        fetchData("schools"),
        fetchData("participations"),
        fetchData("awards"),
        fetchData("contests"),
        fetchData("schoolnames"),
      ]);

    setCountries(countries);
    setSchools(schools);
    setParticipations(participations);
    setAwards(awards);
    setContests(contests);
    setSchoolNames(schoolnames);
  };

  useEffect(() => {
    updateDropdowns();
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    const response = await fetch("/api/updateTables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setResponseMessage(result.message);
  };

  return (
    <div>
      <h1>Update Database</h1>
      <form onSubmit={submitForm}>
        <label htmlFor="award">Award:</label>
        <select id="award" name="award" required>
          {awards.map((award, index) => (
            <option key={index} value={award}>
              {award}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <label htmlFor="country">Country:</label>
        <select id="country" name="country" required>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <label htmlFor="school">School:</label>
        <select id="school" name="school" required>
          {schools.map((school, index) => (
            <option key={index} value={school}>
              {school}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <label htmlFor="participation">Participation:</label>
        <select id="participation" name="participation" required>
          {participations.map((participation, index) => (
            <option key={index} value={participation}>
              {participation}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <button type="submit">Submit</button>
        <label htmlFor="contest">Contest:</label>
        <select id="contest" name="contest" required>
          {contests.map((contest, index) => (
            <option key={index} value={contest}>
              {contest}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <label htmlFor="schoolname">School Name:</label>
        <select id="schoolname" name="schoolname" required>
          {schoolnames.map((schoolname, index) => (
            <option key={index} value={schoolname}>
              {schoolname}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => updateDropdowns()}>
          Refresh
        </button>
        <br />
        <button type="submit">Submit</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}
