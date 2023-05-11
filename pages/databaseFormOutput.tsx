import DatabaseForm from "./databaseForm";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function MyPage() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="md">
      <div>
        <Typography variant={isSmallScreen ? "h4" : "h2"}>
          Participant Info
        </Typography>
        <DatabaseForm />
      </div>
    </Container>
  );
}
