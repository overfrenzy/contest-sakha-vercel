import styles from "../styles/tables.module.css";
import indexStyles from "../styles/index.module.css";
import AppBar from "../components/AppBar1";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";

export default function Home(props) {
  const theme = useTheme();
  const [sortConfig, setSortConfig] = useState({
    key: "total",
    direction: "desc",
  });

  const students = useMemo(() => {
    const sortedStudents = [...props.students];

    sortedStudents.sort((a, b) => {
      const totalA =
        a.problems1.reduce((s, v) => (s += v), 0) +
        a.problems2.reduce((s, v) => (s += v), 0);
      const totalB =
        b.problems1.reduce((s, v) => (s += v), 0) +
        b.problems2.reduce((s, v) => (s += v), 0);

      return sortConfig.direction === "asc" ? totalA - totalB : totalB - totalA;
    });

    return sortedStudents;
  }, [props.students, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const maxProblems1Length = Math.max(
    ...students.map((student) => student.problems1.length)
  );
  const maxProblems2Length = Math.max(
    ...students.map((student) => student.problems2.length)
  );

  const generateHeaders = (length) => {
    if (length === 3) {
      return ["1", "2", "3"];
    } else if (length >= 4) {
      return [
        "a",
        "b",
        "c",
        "d",
        ...Array.from({ length: length - 4 }, (_, i) =>
          String.fromCharCode(101 + i)
        ),
      ];
    }
    return [];
  };

  const headers1 = generateHeaders(maxProblems1Length);
  const headers2 = generateHeaders(maxProblems2Length);

  return (
    <>
      <AppBar />
      <h1 className={indexStyles.title}>Tuymaada-2017</h1>
      <h2 className={indexStyles.title}>Протокол</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <table
            className={styles.table}
            style={{
              width: "100%",
              overflowX: "auto",
              fontSize: theme.breakpoints.down("sm") ? "0.8em" : "1em",
            }}
          >
            <thead>
              <tr>
                <th rowSpan={2}>№</th>
                <th rowSpan={2}>ФИО участника / Full name</th>
                <th rowSpan={2}>Страна / Country</th>
                <th colSpan={maxProblems1Length}>
                  Задания 1 дня / First day problems
                </th>
                <th rowSpan={2}>Итого1 / Total1</th>
                <th colSpan={maxProblems2Length}>
                  Задания 2 дня / Second day problems
                </th>
                <th rowSpan={2}>Итого2 / Total2</th>
                <th
                  rowSpan={2}
                  onClick={() => handleSort("total")}
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Итого / Total
                </th>
                <th rowSpan={2}>Место / Place</th>
              </tr>
              <tr>
                {headers1.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
                {headers2.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((elem, i) => (
                <tr key={i.toString()}>
                  <td>{i + 1}</td>
                  <td>
                    {elem.participant_ru} <br /> {elem.participant_en}
                  </td>
                  <td>
                    {elem.country_ru}
                    <br />
                    {elem.country_en}
                  </td>
                  {elem.problems1.map((problem, idx) => (
                    <td key={idx} className={styles.value}>
                      {problem}
                    </td>
                  ))}
                  <td className={styles.value}>
                    {elem.problems1.reduce((s, v) => (s += v), 0)}
                  </td>
                  {elem.problems2.map((problem, idx) => (
                    <td key={idx} className={styles.value}>
                      {problem}
                    </td>
                  ))}
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
        </Grid>
      </Grid>
    </>
  );
}

// Fetching data from the JSON file
import fsPromises from "fs/promises";
import path from "path";
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "./shared/data2017.json");
  const jsonData = await fsPromises.readFile(filePath);
  const objectData = JSON.parse(jsonData.toString());

  return {
    props: objectData,
  };
}
