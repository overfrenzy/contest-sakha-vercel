import styles from "../styles/tables.module.css";
import Container from '@mui/material/Container';
import AppBar from "../components/AppBar1";

export default function Home(props) {
	const students = props.students;
	return (
		<>
			<AppBar />
			<Container>
				<h1>Tuymaada-2019</h1>
				<h2>Протокол</h2>
				<table className={styles.table}>
					<thead>
						<tr>
							<th rowSpan={2}>№</th>
							<th rowSpan={2}>ФИО участника / Full name</th>
							<th rowSpan={2}>Страна / Country</th>
							<th colSpan={4}>Задания 1 дня / First day problems</th>
							<th rowSpan={2}>Итого1 / Total1</th>
							<th colSpan={4}>Задания 2 дня / Second day problems</th>
							<th rowSpan={2}>Итого2 / Total2</th>
							<th rowSpan={2}>Итого / Total</th>
							<th rowSpan={2}>Место / Place</th>
						</tr>
						<tr>
							<th>1</th>
							<th>2</th>
							<th>3</th>
							<th>4</th>
							<th>1</th>
							<th>2</th>
							<th>3</th>
							<th>4</th>
						</tr>
					</thead>
					<tbody>
						{students.map((elem, i) => (
							<tr key={i.toString()}>
								<td>{i + 1}</td>
								<td>
									{elem.participant_ru}<br />{elem.participant_en}
								</td>
								<td>{elem.country_ru}<br />{elem.country_en}</td>
								<td className={styles.value}>{elem.problems1[0]}</td>
								<td className={styles.value}>{elem.problems1[1]}</td>
								<td className={styles.value}>{elem.problems1[2]}</td>
								<td className={styles.value}>{elem.problems1[3]}</td>
								<td className={styles.value}>
									{elem.problems1.reduce((s, v) => (s += v), 0)}
								</td>
								<td className={styles.value}>{elem.problems2[0]}</td>
								<td className={styles.value}>{elem.problems2[1]}</td>
								<td className={styles.value}>{elem.problems2[2]}</td>
								<td className={styles.value}>{elem.problems2[3]}</td>
								<td className={styles.value}>
									{elem.problems2.reduce((s, v) => (s += v), 0)}
								</td>
								<td className={styles.value}>
									{elem.problems1.reduce((s, v) => (s += v), 0) +
										elem.problems2.reduce((s, v) => (s += v), 0)}
								</td>
								<td className={styles.value}>{elem.place}</td>
							</tr>
						))}
					</tbody>
				</table>
			</Container>
		</>
	);
}

import fsPromises from 'fs/promises';
import path from 'path';
export async function getStaticProps() {
	const filePath = path.join(process.cwd(), './shared/data2019.json');
	const jsonData = await fsPromises.readFile(filePath);
	const objectData = JSON.parse(jsonData.toString());

	return {
		props: objectData
	};
}
