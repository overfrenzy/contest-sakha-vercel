import { Grid, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import styles from "../styles/index.module.css";
import Container from "@mui/material/Container";
import AppBar from "../components/AppBar2";

export default function HomePage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div className={styles.content}>
      <AppBar />
      <Container className={styles.content2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h1>
              Участники олимпиад по программированию Республики Саха (Якутия)
            </h1>
          </Grid>
          <Grid item xs={12}>
          <ButtonGroup
              variant="contained"
              color="secondary"
              size={isSmallScreen ? "small" : "medium"}
              sx={{
                flexWrap: isSmallScreen ? "wrap" : "nowrap",
                "& .MuiButton-root": {
                  minWidth: isSmallScreen ? "100%" : "auto",
                  marginBottom: isSmallScreen ? "8px" : "0",
                },
              }}
            >
              <Button href="/students-2005">Участники-2005</Button>
              <Button href="/students-2016">Участники-2016</Button>
              <Button href="/students-2017">Участники-2017</Button>
              <Button href="/students-2018">Участники-2018</Button>
              <Button href="/students-2019">Участники-2019</Button>
              <Button href="/students-2021">Участники-2021</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
