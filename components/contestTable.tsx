import React from 'react';
import styles from '../styles/tables.module.css';
import { useTheme } from '@mui/material/styles';

function calculateTotal(problems) {
  const total = problems.reduce((acc, problem) => acc + parseInt(problem), 0);
  return `${total}/${problems.length * 100}`;
}

function ContestTable({ filteredParticipations, sortConfig, onSort }) {
  const theme = useTheme();

  const participations = React.useMemo(() => {
    const sortedParticipations = [...filteredParticipations];

    sortedParticipations.sort((a, b) => {
      const totalA =
        a.tasksdone.problems1.reduce((s, v) => (s += parseInt(v, 10)), 0) +
        a.tasksdone.problems2.reduce((s, v) => (s += parseInt(v, 10)), 0);
      const totalB =
        b.tasksdone.problems1.reduce((s, v) => (s += parseInt(v, 10)), 0) +
        b.tasksdone.problems2.reduce((s, v) => (s += parseInt(v, 10)), 0);

      return sortConfig.direction === 'asc' ? totalA - totalB : totalB - totalA;
    });

    return sortedParticipations.map((participation, index) => {
      const problems1 = participation.tasksdone.problems1.map(String);
      const problems2 = participation.tasksdone.problems2.map(String);
      const total = calculateTotal([...problems1, ...problems2]);
      return {
        awardName: participation.awardName,
        name: participation.name,
        country: participation.country,
        problems1,
        problems2,
        total,
      };
    });
  }, [filteredParticipations, sortConfig]);

  const maxProblems1Length = Math.max(
    ...participations.map((participation) => participation.problems1.length)
  );
  const maxProblems2Length = Math.max(
    ...participations.map((participation) => participation.problems2.length)
  );

  const generateHeaders = (length) => {
    if (length === 3) {
      return ['1', '2', '3'];
    } else if (length >= 4) {
      return [
        'a',
        'b',
        'c',
        'd',
        ...Array.from({ length: length - 4 }, (_, i) =>
          String.fromCharCode(101 + i)
        ),
      ];
    }
    return [];
  };

  const headers1 = generateHeaders(maxProblems1Length);
  const headers2 = generateHeaders(maxProblems2Length);

  const calculateColumnTotal = (values) => {
    return values.reduce((total, value) => total + parseInt(value), 0);
  };

  const columnTotals = [
    '', // Empty cell for the first column
    '', // Empty cell for the second column
    '', // Empty cell for the third column
    ...headers1.map((header, index) => {
      const values = participations.map((participation) =>
        parseInt(participation.problems1[index] || 0, 10)
      );
      return calculateColumnTotal(values);
    }),
    ...headers2.map((header, index) => {
      const values = participations.map((participation) =>
        parseInt(participation.problems2[index] || 0, 10)
      );
      return calculateColumnTotal(values);
    }),
  ];

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>№</th>
          <th>Название премии</th>
          <th>Фамилия, имя</th>
          <th>Страна</th>
          {headers1.map((header) => (
            <th key={header}>{header}</th>
          ))}
          {headers2.map((header) => (
            <th key={header}>{header}</th>
          ))}
          <th>Всего</th>
        </tr>
      </thead>
      <tbody>
        {participations.map((participation, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{participation.awardName}</td>
            <td>{participation.name}</td>
            <td>{participation.country}</td>
            {headers1.map((header, index) => (
              <td key={index}>{participation.problems1[index]}</td>
            ))}
            {headers2.map((header, index) => (
              <td key={index}>{participation.problems2[index]}</td>
            ))}
            <td>{participation.total}</td>
          </tr>
        ))}
        <tr className={styles.columnTotals}>
          <td colSpan={4}>Всего задач:</td>
          {columnTotals.map((total, index) => (
            <td key={index}>{total}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export default ContestTable;
