import React, { useState, useEffect } from 'react';
import ContestTable from '../components/contestTable';
import AppBar from '../components/AppBar1';
import indexStyles from '../styles/index.module.css';
import Grid from '@mui/material/Grid';

export default function Home() {
  const [filteredParticipations, setFilteredParticipations] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'total',
    direction: 'desc',
  });

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestName = encodeURIComponent('TUY-2016'); // Change contest name here
        const response = await fetch(`/api/fetchContests?contestName=${contestName}`);
        const data = await response.json();
        setFilteredParticipations(data.filteredParticipations);
      } catch (error) {
        console.error(error);
        setFilteredParticipations([]);
      }
    };

    fetchContests();
  }, []);

  return (
    <>
      <AppBar />
      <h1 className={indexStyles.title}>Tuymaada-2016</h1>
      <h2 className={indexStyles.title}>Протокол</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ContestTable
            filteredParticipations={filteredParticipations}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </Grid>
      </Grid>
    </>
  );
}
