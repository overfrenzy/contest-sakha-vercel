import Image from 'next/image';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import AppBar from '../components/AppBar2';
import styles from '../styles/index.module.css';
//export const config = {  runtime: "edge",};

export default function Home(props) {
	const students = props.students;
	return (
		<Box className={styles.content}>
		  <AppBar />
		  <Container sx={{ marginY: 3 }}>
			<h1>Участники</h1>
			<Grid container spacing={6}>
			  {students.map((elem, i) => (
				<Grid item xs={3} key={i.toString()}>
				  <Paper elevation={3}>
					<Box className={styles.img}>
					  <Image src={elem.image} alt="" fill />
					</Box>
					<Box paddingX={1}>
					  <Typography variant="subtitle1" component="h2">
						{elem.participant_ru}
					  </Typography>
					  <Box
						sx={{
						  display: 'flex',
						  alignItems: 'Center',
						}}
					  >
						<Typography variant="body2" component="p" marginLeft={0.5}>
						  {elem.country_ru}
						</Typography>
					  </Box>
					  <Box
						sx={{
						  display: 'flex',
						  alignItems: 'Center',
						}}
					  >
						<Typography variant="body2" component="p" marginLeft={0.5}>
						  {elem.place} место
						</Typography>
					  </Box>
					</Box>
				  </Paper>
				</Grid>
			  ))}
			</Grid>
		  </Container>
		</Box>
	  );
	}

export async function getStaticProps() {
  const res = await fetch('https://url/data2005.json');
  const students = await res.json();

  return {
    props: {
      students
    }
  };
}
//cloudflare pages requires next.js projects to run on edge runtime which in turn requires api, it would be feasible to make api like /api/data to retrieve data from db and send a JSON response