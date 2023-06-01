import { Container, Typography } from "@mui/material";
import ParticipantTable from "../components/ParticipantTable";

export default function Home({ students }) {
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

export async function getStaticProps() {
  const archiveName = "tuy-2021"; // Change the archive name here
  const contestName = "TUY-2021"; // Change the contest name here

  const response = await fetch(
    `/api/fetchStudents?archiveName=${archiveName}&contestName=${contestName}`
  );
  const data = await response.json();

  return {
    props: {
      students: data.students,
    },
  };
}
