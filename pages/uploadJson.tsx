import { useState } from "react";

async function uploadJSON(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = new FileReader();
  
        reader.onload = async (event) => {
          const data = JSON.parse(event.target!.result as string);
  
          const functionUrl = "https://functions.yandexcloud.net/d4edctk1gbs4crg84dfu"; //populate-from-json ycf
  
          const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
  
          const result = await response.json();
          resolve({ success: true, message: result.message });
        };
  
        reader.onerror = (error) => {
          console.error("Error:", error);
          reject({ success: false, message: "Error reading JSON file" });
        };
  
        reader.readAsText(file);
      } catch (error) {
        console.error("Error:", error);
        reject({ success: false, message: "Error uploading JSON file" });
      }
    });
  }
  


export default function UploadJSON() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a JSON file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadJSON(file);
    setMessage(result.message);
  };

  return (
    <div>
      <h1>Upload JSON File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".json" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
