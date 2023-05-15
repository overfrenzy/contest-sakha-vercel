import React from 'react';
import fetch from 'isomorphic-unfetch';

const CheckYdbConnection = ({ isConnected, text }) => {
  return (
    <div>
      {isConnected ? (
        <p>Connected to YDB: {text}</p>
      ) : (
        <p>Not connected to YDB: {text}</p>
      )}
    </div>
  );
};

export async function getServerSideProps() {
  const response = await fetch('https://functions.yandexcloud.net/d4eqsnhn46kj7oel7t2k');
  const text = await response.text();

  return {
    props: {
      isConnected: response.status === 200,
      text,
    },
  };
}

export default CheckYdbConnection;
