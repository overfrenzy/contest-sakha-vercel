import React from 'react';
import Component from '../components/tasksTable';

const archiveName = "tuybook2021";
const markdownFilePath = "tuybook2021.md";

const MainPage = () => {
  return (
    <div>
      <Component archiveName={archiveName} markdownFilePath={markdownFilePath} />
    </div>
  );
};

export default MainPage;
