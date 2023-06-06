import React from 'react';
import {useRouter} from 'next/router';

const ResultPage = () => {
  const router = useRouter();
  const { result } = router.query;
  
  const originalData = decodeURIComponent(result as string);

  return (
    <div>
      <h1>Result</h1>
      <pre>{originalData}</pre>
    </div>
  );
};

export default ResultPage;