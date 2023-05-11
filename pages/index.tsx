import { Grid, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import styles from "../styles/index.module.css";
import Container from "@mui/material/Container";
import AppBar from "../components/AppBar1";

export default function HomePage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div className={styles.content}>
      <AppBar />
      <Container className={styles.content2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h1>Олимпиады по программированию Республики Саха (Якутия)</h1>
          </Grid>
          <Grid item xs={12}>
            <ButtonGroup
              variant="contained"
              color="primary"
              size={isSmallScreen ? "small" : "medium"}
            >
              <Button href="/tuy-2005">Туймаада-2005</Button>
              <Button href="/tuy-2016">Туймаада-2016</Button>
              <Button href="/tuy-2017">Туймаада-2017</Button>
              <Button href="/tuy-2018">Туймаада-2018</Button>
              <Button href="/tuy-2019">Туймаада-2019</Button>
              <Button href="/tuy-2021">Туймаада-2021</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
