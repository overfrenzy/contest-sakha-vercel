import React from 'react';
import Component from '../components/tasksTable';
import Checker from '../components/checker';

const archiveName = "tuybook2021"; //change archive name for the contest tasks here
const archiveName2 = "granopodus-26%24windows.zip"; // change the archive name for the test case here
const markdownFilePath = "tuybook2021.md"; //change markdown name in the contest task archive

const MainPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Checker archiveName={archiveName2} />
      </div>
      <Component archiveName={archiveName} markdownFilePath={markdownFilePath} />
    </div>
  );
};

export default MainPage;
