import { useState, ChangeEvent, FormEvent } from 'react';
import { Button, CircularProgress } from '@mui/material';

export default function SubmitProgram() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/checker', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit the file');
      }

      const data = await response.text();
      setStatus('success');
      setResult(data);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".cpp" onChange={handleFileChange} />
        <Button type="submit" variant="contained" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <CircularProgress size={24} />
          ) : (
            'Submit'
          )}
        </Button>
      </form>
      {status === 'success' && <pre>{result}</pre>}
      {status === 'error' && <div>Failed to submit the file. Please try again.</div>}
    </div>
  );
}
