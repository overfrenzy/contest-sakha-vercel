import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import InsertAward from "../components/forms/formAward";
import InsertContest from "../components/forms/formContest";
import InsertCountry from "../components/forms/formCountry";
import InsertSchoolName from "../components/forms/formSchoolName";
import InsertParticipant from "../components/forms/formParticipant";
import { useProtectedPage } from "../components/protectedPage";

const App: React.FC = () => {
  useProtectedPage();
  return (
    <div>
      <Grid container spacing={2} direction="column" alignItems="flex-start" justifyContent="flex-start">
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <InsertAward />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <InsertContest />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <InsertCountry />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <InsertSchoolName />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <InsertParticipant />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default App;
