import React, { useState, useEffect } from "react";

interface Data {
  countries: { country_id: string; name: string }[];
  schools: { school_id: string; schoolname_id: string }[];
  participations: { participation_id: string; contest_id: string }[];
  awards: { award_id: string; name: string }[];
  contests: { contest_id: string; name: string }[];
  schoolNames: { schoolname_id: string; name: string }[];
}

function InsertParticipant() {
  const [data, setData] = useState<Data>({
    countries: [],
    schools: [],
    participations: [],
    awards: [],
    contests: [],
    schoolNames: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedParticipation, setSelectedParticipation] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [participantName, setParticipantName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetch(
      "https://functions.yandexcloud.net/d4e8s3vflh5b7h6dgsdn" //fetch-db function
    );
    const data = await response.json();
    setData(data);
    setLoading(false);
  }

  async function submitForm() {
    const participant = {
      school_id: selectedSchool,
      country_id: selectedCountry,
      participation_id: selectedParticipation,
      award_id: selectedAward,
      name: participantName,
    };

    const response = await fetch(
      "https://functions.yandexcloud.net/d4eqfmirprh225fg72au", //insertParticipant function
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participant),
      }
    );

    const result = await response.json();
    console.log(result);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <label>
        Country:
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {data.countries &&
            data.countries.map((country) => (
              <option key={country.country_id} value={country.country_id}>
                {country.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        School:
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          {data.schools &&
            data.schools.map((school) => (
              <option key={school.school_id} value={school.school_id}>
                {
                  data.schoolNames.find(
                    (sn) => sn.schoolname_id === school.schoolname_id
                  )?.name
                }
              </option>
            ))}
        </select>
      </label>
      <label>
        Participation:
        <select
          value={selectedParticipation}
          onChange={(e) => setSelectedParticipation(e.target.value)}
        >
          {data.participations &&
            data.participations.map((participation) => (
              <option
                key={participation.participation_id}
                value={participation.participation_id}
              >
                {
                  data.contests.find(
                    (c) => c.contest_id === participation.contest_id
                  )?.name
                }
              </option>
            ))}
        </select>
      </label>
      <label>
        Award:
        <select
          value={selectedAward}
          onChange={(e) => setSelectedAward(e.target.value)}
        >
          {data.awards &&
            data.awards.map((award) => (
              <option key={award.award_id} value={award.award_id}>
                {award.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        Participant Name:
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
        />
      </label>
      <button onClick={submitForm}>Update</button>
    </div>
  );
}

export default InsertParticipant;
