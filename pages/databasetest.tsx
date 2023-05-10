import React, { useState, useEffect } from "react";

interface Country {
  name: string;
}

interface SchoolName {
  name: string;
}

interface School {
  schoolname: SchoolName;
}

interface Contest {
  name: string;
  year: number;
}

interface Participation {
  contest: Contest;
}

interface Award {
  name: string;
}

interface Participant {
  id: number;
  name: string;
  country: Country;
  school: School;
  participation: Participation;
  award: Award;
}

function DatabaseTest() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }
        setParticipants(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Country</th>
          <th>School Name</th>
          <th>Contest Name</th>
          <th>Year</th>
          <th>Award Name</th>
        </tr>
      </thead>
      <tbody>
        {participants.map((participant) => (
          <tr key={participant.id}>
            <td>{participant.name}</td>
            <td>{participant.country?.name}</td>
            <td>{participant.school?.schoolname?.name}</td>
            <td>{participant.participation?.contest?.name}</td>
            <td>{participant.participation?.contest?.year}</td>
            <td>{participant.award?.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DatabaseTest;
