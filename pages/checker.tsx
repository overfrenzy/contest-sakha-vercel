import React, { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://bbae9r5ui6925a9jluiq.containers.yandexcloud.net/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResponseText(response.data); // Update the response text state
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
      <h1>Upload Page</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
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
