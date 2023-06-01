import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import Image from "next/image";
import styles from "../styles/index.module.css";

export default function ParticipantTable({ students }) {
  return (
    <div className={styles.content}>
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
