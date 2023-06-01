import React, { useState } from 'react';
import ContestTable from '../components/contestTable';
import AppBar from '../components/AppBar1';
import indexStyles from '../styles/index.module.css';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

export default function Home(props) {
  const theme = useTheme();
  const [sortConfig, setSortConfig] = useState({
    key: 'total',
    direction: 'desc',
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <AppBar />
      <h1 className={indexStyles.title}>Tuymaada-2021</h1>
      <h2 className={indexStyles.title}>Протокол</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ContestTable
            filteredParticipations={props.filteredParticipations}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </Grid>
      </Grid>
    </>
  );
}

export async function getStaticProps() {
  const response = await fetch('/api/fetchContests');
  const data = await response.json();

  return {
    props: {
      filteredParticipations: data.filteredParticipations,
    },
  };
}
