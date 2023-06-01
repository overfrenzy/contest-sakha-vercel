import { Container, Typography } from "@mui/material";
import ParticipantTable from "../components/participantTable";
import { useState, useEffect } from "react";

export default function Students2021() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const archiveName = encodeURIComponent("tuy-2021"); // Change archive name here
        const contestName = encodeURIComponent("TUY-2021"); // Charge contest name here
        const response = await fetch(
          `/api/fetchParticipants?archiveName=${archiveName}&contestName=${contestName}`
        );
        const data = await response.json();
        setStudents(data.students);
      } catch (error) {
        console.error(error);
        setStudents([]);
      }
    };

    fetchParticipants();
  }, []);

  return (
    <div>
      <Container sx={{ marginY: 3 }}>
        <Typography variant="h2" component="h2">
          Участники
        </Typography>
        <ParticipantTable students={students} />
      </Container>
    </div>
  );
}
