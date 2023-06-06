import React, { useState } from 'react';
import axios from 'axios';
import indexStyles from '../styles/index.module.css';

type ArchiveOption = {
  name: string;
  archive: string;
};

type CheckerProps = {
  testCaseArchives: ArchiveOption[];
};

export function Checker({ testCaseArchives }: CheckerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedArchive, setSelectedArchive] = useState(testCaseArchives[0]);
  const [responseText, setResponseText] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const headers = {
          'Content-Type': 'multipart/form-data',
        };

        const response = await axios.post(
          'https://bbae9r5ui6925a9jluiq.containers.yandexcloud.net/',
          formData,
          {
            headers: headers,
            params: {
              archiveName: selectedArchive.archive,
            },
          }
        );

        setResponseText(response.data);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      }
    } else {
      alert('Please select a file');
    }
  };

  return (
    <div>
      <h1 className={indexStyles.title}>Upload your solution</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <select
          value={selectedArchive.archive}
          onChange={(event) => {
            const selectedOption = testCaseArchives.find(
              (option) => option.archive === event.target.value
            );
            if (selectedOption) {
              setSelectedArchive(selectedOption);
            }
          }}
        >
          {testCaseArchives.map((option) => (
            <option key={option.archive} value={option.archive}>
              {option.name}
            </option>
          ))}
        </select>
        <button type="submit">Upload</button>
      </form>
      {responseText && (
        <div>
          <h2>Response:</h2>
          <pre>{responseText}</pre>
        </div>
      )}
    </div>
  );
}

export default Checker;
