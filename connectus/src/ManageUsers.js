import React, { useEffect, useState } from 'react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const communityId = localStorage.getItem('communityId');
        if (!communityId) {
          setError('Community ID not found. Please select or create a community.');
          setLoading(false);
          return;
        }
        if (!communityId.trim()) {
          setError('Community ID is empty. Please re-join or re-create your community.');
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5000/api/community/${communityId}/users`, {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server error: Received invalid response from server.');
        }
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch users.');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Error fetching users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="feature-page card">
      <h1 className="feature-title">Manage Users</h1>
      <p>List and manage users in your community here.</p>
      {loading && <div>Loading users...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div>No users found in this community.</div>
      )}
      {!loading && !error && users.length > 0 && (
        <table style={{ width: '100%', marginTop: '1.5rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Flat Number</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.flatNumber || '-'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
