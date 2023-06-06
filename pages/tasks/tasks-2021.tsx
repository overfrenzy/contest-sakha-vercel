import React from 'react';
import TasksTable from '../../components/tasksTable';
import Checker from '../../components/checker';

const archiveName = "tuybook2021"; //change archive name for the contest tasks here
const markdownFilePath = "tuybook2021.md"; //change markdown name in the contest task archive

const availableTestCaseArchives = [
  { name: "Task A", archive: "granopodus-26%24windows.zip" },
  { name: "Task B", archive: "another-archive.zip" },
  // Add more test cases archives, maybe implement fetching this from the db?
];

const MainPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Checker testCaseArchives={availableTestCaseArchives} />
      </div>
      <TasksTable archiveName={archiveName} markdownFilePath={markdownFilePath} />
    </div>
  );
};

export default MainPage;
