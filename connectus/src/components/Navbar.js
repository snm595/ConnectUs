import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userRole }) => {
  return (
    <nav>
      <ul>
        {/* Add Manage Users link for admin */}
        {userRole === 'admin' && (
          <li>
            <Link to="/manage-users">Manage Users</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;