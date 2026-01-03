import React, { useState } from "react";
import CreateCommunity from "./CreateCommunity";
import JoinCommunity from "./JoinCommunity";

function CommunityApp() {
  const [validCodes, setValidCodes] = useState([]); // Store valid community codes

  // Function to add a newly generated code to the valid codes
  const addCode = (code) => {
    setValidCodes((prev) => [...prev, code]);
  };

  return (
    <div>
      <h1>Community Platform</h1>
      <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
        <CreateCommunity onCodeGenerated={addCode} />
      </div>
      <div style={{ border: "1px solid #ccc", padding: "20px" }}>
        <JoinCommunity validCodes={validCodes} />
      </div>
    </div>
  );
}

export default CommunityApp;
