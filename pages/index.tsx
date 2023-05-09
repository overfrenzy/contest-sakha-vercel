import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import styles from '../styles/index.module.css';
import Container from '@mui/material/Container';
import AppBar from '../components/AppBar1';
import Link from 'next/link';
//export const config = {  runtime: "edge",};

export default function HomePage() {
	return (
		<div className={styles.content}>
			<AppBar />
			<Container className={styles.content2}>
				<h1>Олимпиады по программированию Республики Саха (Якутия)</h1>
				<ButtonGroup variant="contained" color="primary">
					<Button href="/tuy-2005">
						Туймаада-2005
					</Button>
					<Button href="/tuy-2016">
						Туймаада-2016
					</Button>
					<Button href="/tuy-2017">
						Туймаада-2017
					</Button>
					<Button href="/tuy-2018">
						Туймаада-2018
					</Button>
					<Button href="/tuy-2019">
						Туймаада-2019
					</Button>
					<Button href="/tuy-2021">
						Туймаада-2021
					</Button>
				</ButtonGroup>
			</Container>
		</div >
	);
}
