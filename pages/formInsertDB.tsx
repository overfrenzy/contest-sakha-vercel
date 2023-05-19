import React from "react";
import InsertAward from "./formAward";
import InsertContest from "./formContest";
import InsertCountry from "./formCountry";
import InsertSchoolName from "./formSchoolName";

const App: React.FC = () => {
  return (
    <div>
      <InsertAward />
      <hr style={{ margin: "2rem 0" }} />
      <InsertContest />
      <hr style={{ margin: "2rem 0" }} />
      <InsertCountry />
      <hr style={{ margin: "2rem 0" }} />
      <InsertSchoolName />
    </div>
  );
};

export default App;
