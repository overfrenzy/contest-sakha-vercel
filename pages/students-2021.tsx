import { Container, Typography } from "@mui/material";
import ParticipantTable from "../components/participantTable";

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
  const archiveName = encodeURIComponent("tuy-2021");
  const contestName = encodeURIComponent("TUY-2021");

  const response = await fetch(
    `/api/fetchParticipants?archiveName=${archiveName}&contestName=${contestName}`
  );
  const data = await response.json();

  return {
    props: {
      students: data.students,
    },
  };
}
