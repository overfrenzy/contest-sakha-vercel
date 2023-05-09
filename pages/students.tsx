import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import styles from '../styles/index.module.css';
import Container from '@mui/material/Container';
import AppBar from '../components/AppBar2';

export default function Home() {
	return (
		<div className={styles.content}>
			<AppBar />
			<Container sx={{ marginY: 3 }}>
				<h1>Олимпиады по программированию Республики Саха (Якутия)</h1>
				<ButtonGroup variant="contained" color="secondary">
					<Button href="/students-2005">
						Участники-2005
					</Button>
					<Button href="/students-2016">
						Участники-2016
					</Button>
					<Button href="/students-2017">
						Участники-2017
					</Button>
					<Button href="/students-2018">
						Участники-2018
					</Button>
					<Button href="/students-2019">
						Участники-2019
					</Button>
					<Button href="/students-2021">
						Участники-2021
					</Button>
				</ButtonGroup>
			</Container>
		</div >
	);
}