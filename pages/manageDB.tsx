import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import ManageAward from "../components/manage/manageAwards";
import ManageContest from "../components/manage/manageContests"; //net yet implemented
//import ManageCountry from "../components/manage/manageCountry";
//import ManageSchoolName from "../components/manage/manageSchoolName";
//import ManageParticipant from "../components/manage/manageParticipant";
import { useProtectedPage } from "../components/protectedPage";

const ManageDB: React.FC = () => {
  useProtectedPage();
  return (
    <div>
      <Grid
        container
        spacing={2}
        direction="column"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <ManageAward />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <ManageContest />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ManageDB;
