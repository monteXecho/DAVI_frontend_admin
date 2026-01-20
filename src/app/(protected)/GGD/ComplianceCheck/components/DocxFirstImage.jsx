import React, { useState } from "react";
import { getFirstImageOfDoc } from "../services/api";

export default function DocxFirstImage({ fileKey }) {
  const [filename, setFilename] = useState("Child-Planning.docx");
  const [imgSrc, setImgSrc] = useState("");
  const [error, setError] = useState("");

  const fetchImage = async () => {
    setError("");
    setImgSrc("");
    try {
      const data = getFirstImageOfDoc(fileKey);
      console.log(getFirstImageOfDoc);
      setImgSrc(data.data_url); // already a data URL, just plug into <img>
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div
      style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h2>Preview First Image from DOCX</h2>
      <label>
        DOCX filename:&nbsp;
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="example.docx"
          style={{ width: "100%" }}
        />
      </label>
      <button onClick={fetchImage} style={{ marginTop: 12 }}>
        Fetch Image
      </button>

      {error && (
        <p style={{ color: "crimson", marginTop: 12 }}>Error: {error}</p>
      )}

      {imgSrc && (
        <div style={{ marginTop: 16 }}>
          <img
            src={imgSrc}
            alt="First from DOCX"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
