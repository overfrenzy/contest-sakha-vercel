import React from 'react';
import TasksTable from '../../components/tasksTable';
import Checker from '../../components/checker';

const archiveName = "tuybook2021"; //change archive name for the contest tasks here
const markdownFilePath = "tuybook2021.md"; //change markdown name in the contest task archive

const availableTestCaseArchives = [
  { name: "Task A: Granopodus", archive: "granopodus-26$windows.zip" },
  { name: "Task B: Mex Tree", archive: "mex-tree-17$windows.zip" },
  { name: "Task C: Sum of Digits", archive: "sum-of-digits-18$windows.zip" },
  { name: "Task D: International Olympiad", archive: "international-olympiad-29$windows.zip" }
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
