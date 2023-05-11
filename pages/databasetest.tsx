import { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";

interface Country {
  name: string;
}

interface SchoolName {
  name: string;
}

interface School {
  schoolname: SchoolName;
}

interface Contest {
  name: string;
  year: number;
}

interface Participation {
  contest: Contest;
}

interface Award {
  name: string;
}

interface Participant {
  id: number;
  name: string;
  country_name: string;
  school_name: string;
  contest_name: string;
  contest_year: number;
  award_name: string;
}

function DatabaseTest() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }
        setParticipants(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  const columns = [
    {
      name: "name",
      label: "Name",
    },
    {
      name: "country_name",
      label: "Country",
    },
    {
      name: "school_name",
      label: "School Name",
    },
    {
      name: "contest_name",
      label: "Contest Name",
    },
    {
      name: "contest_year",
      label: "Year",
    },
    {
      name: "award_name",
      label: "Award Name",
    },
  ];

  const options = {
    selectableRows: "none",
    responsive: "standard",
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <MUIDataTable
      title={"Participants"}
      data={participants}
      columns={columns}
      options={options}
    />
  );
}

export default DatabaseTest;
