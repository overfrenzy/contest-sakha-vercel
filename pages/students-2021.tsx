import fsPromises from "fs/promises";
import path from "path";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import AppBar from "../components/AppBar2";
import styles from "../styles/index.module.css";

export default function Home(props) {
  const students = props.students;

  return (
    <div className={styles.content}>
      <AppBar />
      <Container sx={{ marginY: 3 }}>
        <Typography variant="h2" component="h2">
          Участники
        </Typography>
        <Grid container spacing={2}>
          {students.map((elem, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i.toString()}>
              <Paper elevation={3}>
                <div className={styles["image-container"]}>
                  <img src={elem.image} alt="" />
                </div>
                <Box padding={2}>
                  <Typography variant="subtitle1" component="h2">
                    {elem.participant_ru}
                  </Typography>
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
                    ) : null}
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
  const filePath = path.join(process.cwd(), "./shared/data2021.json");
  const jsonData = await fsPromises.readFile(filePath);
  const objectData = JSON.parse(jsonData.toString());

  return {
    props: objectData,
  };
}
