import { useRouter } from 'next/router';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';

export default function Home({ data }) {
  const router = useRouter();

  return (
    <Table>
      <TableBody>
        {data.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.name}</TableCell>
            <TableCell>{participant.Country}</TableCell>
            <TableCell>{participant.School}</TableCell>
            <TableCell>{participant.Participation}</TableCell>
            <TableCell>{participant.Award}</TableCell>
            {/* Add more fields here */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export async function getServerSideProps() {
  const res = await fetch('https://contest-sakha.pages.dev/api/data'); //http://localhost:3000/api/data
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
//retrieve JSON data from the response and show it