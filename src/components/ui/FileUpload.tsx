"use client";

import { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log("percentCompleted: ", percentCompleted);
          setProgress(percentCompleted);
        },
      });
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-60 bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-4">File Upload</h1>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 p-2 border rounded w-full text-sm"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Upload
        </button>
      </div>
      {progress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%`, maxWidth: "100%" }}
            ></div>
          </div>
          <p className="text-sm mt-2">{progress}% Uploaded</p>
        </div>
      )}
      {/* {file && (
        <p className="text-sm mt-2 truncate">Selected file: {file.name}</p>
      )} */}
    </div>
  );
}
