import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import InsertAward from "./formAward";
import InsertContest from "./formContest";
import InsertCountry from "./formCountry";
import InsertSchoolName from "./formSchoolName";
import InsertParticipant from "./formParticipant";

const App: React.FC = () => {
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
