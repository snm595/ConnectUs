import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function JoinCommunity() {
  const [blockNo, setBlockNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [members, setMembers] = useState([{ name: "", phone: "" }]);
  const [enteredCode, setEnteredCode] = useState("");
  const [joinStatus, setJoinStatus] = useState(""); // To track the success/failure message
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize navigate

  const handleAddPerson = () => {
    setMembers([...members, { name: "", phone: "" }]);
  };

  const handleMemberChange = (index, key, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][key] = value;
    setMembers(updatedMembers);
  };

  const handleJoin = async () => {
    setLoading(true);
    setJoinStatus("");
    try {
      // Get userId from localStorage (should be set at login/signup)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setJoinStatus("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      // Validate code and join community via backend
      const response = await fetch('http://localhost:5000/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: enteredCode, userId })
      });
      const data = await response.json();
      if (response.ok) {
        // Store communityId (prefer backend's unique _id, fallback to code)
        if (data.community && data.community._id) {
          localStorage.setItem('communityId', data.community._id);
        } else if (data.community && data.community.code) {
          localStorage.setItem('communityId', data.community.code);
        }
        // Optionally update user object in localStorage
        if (data.community && data.community._id) {
          let user = localStorage.getItem('user');
          if (user) {
            user = JSON.parse(user);
            user.community = data.community._id;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        setJoinStatus("You have successfully joined the community!");
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } else {
        setJoinStatus(data.message || 'Invalid community code. Please try again.');
      }
    } catch (err) {
      setJoinStatus('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Join Community</h2>
      <div>
        <label>Community Code (Provided by Admin):</label>
        <input
          type="text"
          placeholder="Enter Code"
          value={enteredCode}
          onChange={(e) => setEnteredCode(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>Block No:</label>
        <input
          type="text"
          value={blockNo}
          onChange={(e) => setBlockNo(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>House No:</label>
        <input
          type="text"
          value={houseNo}
          onChange={(e) => setHouseNo(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Members:</h3>
        {members.map((member, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) => handleMemberChange(index, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone"
              value={member.phone}
              onChange={(e) => handleMemberChange(index, "phone", e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAddPerson} style={{ marginTop: "10px" }}>
          + Add Person
        </button>
      </div>
      <button onClick={handleJoin} style={{ marginTop: "20px" }} disabled={loading}>
        {loading ? 'Joining...' : 'Join'}
      </button>

      {joinStatus && (
        <div style={{ marginTop: "20px", color: joinStatus === "You have successfully joined the community!" ? "green" : "red" }}>
          <h3>{joinStatus}</h3>
        </div>
      )}
    </div>
  );
}

export default JoinCommunity;
