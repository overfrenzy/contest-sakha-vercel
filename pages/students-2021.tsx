import fetch from "node-fetch";
import unzipper from "unzipper";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import AppBar from "../components/AppBar2";
import Image from "next/image";
import styles from "../styles/index.module.css";

interface Contest {
  name: string;
  contest_id: string;
}

interface Participation {
  contest_id: string;
  participant_id: string;
  award_id: string;
}

interface Participant {
  participant_id: string;
  name: string;
  country_id: string;
}

interface Country {
  country_id: string;
  name: string;
}

interface Award {
  award_id: string;
  name: string;
}

interface ArchiveData {
  contests: Contest[];
  participations: Participation[];
  participants: Participant[];
  countries: Country[];
  awards: Award[];
}

export default function Home(props) {
  const students = props.students;

  return (
    <div className={styles.content}>
      <AppBar />
      <Container sx={{ marginY: 3 }}>
        <Typography variant="h2" component="h2">
          Участники
        </Typography>
        <Grid container spacing={2} alignItems="stretch">
          {students.map((elem, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i.toString()}>
              <Paper elevation={3}>
                <div className={styles["image-container"]}>
                  <Image
                    src={elem.image}
                    alt={elem.participant_ru}
                    width={300}
                    height={300}
                    layout="fixed"
                  />
                </div>
                <Box padding={2}>
                  <Box minHeight="3em">
                    <Typography variant="subtitle1" component="h2">
                      {elem.participant_ru}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 1,
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" component="p" marginLeft={0.5}>
                      {elem.country_ru}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "20px",
                      flexGrow: 1,
                    }}
                  >
                    {elem.place !== "" ? (
                      <Typography
                        variant="body2"
                        component="p"
                        marginLeft={0.5}
                      >
                        {elem.place} место
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        component="p"
                        marginLeft={0.5}
                      >
                        {" "}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export async function getStaticProps() {
  const archiveName = "tuy-2021"; // Change the archive name here

  // Fetch the participant data from ydb
  const response = await fetch(
    "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"
  );
  const data: unknown = await response.json(); // Specify unknown type

  const typedData = data as ArchiveData; // Cast data to ArchiveData type

  const contestPage = typedData.contests.find(
    (contest) => contest.name === "TUY-2021"
  );
  const contestPageId = contestPage ? contestPage.contest_id : null;

  const filteredParticipations = typedData.participations.filter(
    (participation) => participation.contest_id === contestPageId
  );

  // Join participations with participants, countries, and awards
  const participations = await Promise.all(
    filteredParticipations.map(async (participation) => {
      const participant = typedData.participants.find(
        (participant) =>
          participant.participant_id === participation.participant_id
      );
      const country = typedData.countries.find(
        (country) => country.country_id === participant?.country_id
      );
      const award = typedData.awards.find(
        (award) => award.award_id === participation.award_id
      );

      const archiveUrl = `https://storage.yandexcloud.net/contest-bucket/${archiveName}.zip`;
      const zipResponse = await fetch(archiveUrl);
      if (!zipResponse.ok) {
        throw new Error("Failed to download the archive.");
      }
      const zipBuffer = await zipResponse.buffer();

      const extractFolderPath = await unzipper.Open.buffer(zipBuffer);
      const imageExtensions = [".png", ".jpg", ".jpeg"]; // Supported image extensions
      const imageFilePath = imageExtensions
        .map((extension) => `${participant?.name}${extension}`)
        .find((path) =>
          extractFolderPath.files.some((file) => file.path === path)
        );
      const extractedImage = extractFolderPath.files.find(
        (file) => file.path === imageFilePath
      );

      let image;
      if (extractedImage) {
        const imageBuffer = await extractedImage.buffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");
        const imageUrl = `data:image/${extractedImage.type};base64,${base64Image}`;
        image = imageUrl;
      } else {
        // Use a default image URL if no image was found
        image =
          "https://villagesonmacarthur.com/wp-content/uploads/2020/12/Blank-Avatar.png";
      }

      return {
        participant_ru: participant?.name,
        country_ru: country?.name,
        place: award ? award.name : "",
        image: image,
      };
    })
  );

  return {
    props: {
      students: participations,
    },
  };
}
