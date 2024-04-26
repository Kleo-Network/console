import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserCount = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('/user-count');
        setUserCount(response.data.user_count);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Total Users</h2>
      <p className="text-4xl font-bold text-blue-600">{userCount}</p>
    </div>
  );
};

const InactiveUsers = () => {
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [totalInactiveUsers, setTotalInactiveUsers] = useState(0);

  useEffect(() => {
    const fetchInactiveUsers = async () => {
      try {
        const response = await axios.get('/doa-users');
        setInactiveUsers(response.data.user_history_counts);
        setTotalInactiveUsers(response.data.total_inactive_users);
      } catch (error) {
        console.error('Error fetching inactive users:', error);
      }
    };

    fetchInactiveUsers();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Inactive Users</h2>
      <p className="text-xl mb-4">Total Inactive Users: {totalInactiveUsers}</p>
      <table className="w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">User</th>
            <th className="py-3 px-6 text-left">History Count</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {inactiveUsers.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-4 px-6">{user.user}</td>
              <td className="py-4 px-6">{user.history_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UsersWithOldPublishedCards = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users-with-old-published-cards');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users with old published cards:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Users with Old Published Cards</h2>
      <table className="w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">User</th>
            <th className="py-3 px-6 text-left">Last Published At</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {users.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-4 px-6">{user.user}</td>
              <td className="py-4 px-6">{new Date(user.last_published_at * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UserCount />
        <InactiveUsers />
        <UsersWithOldPublishedCards />
      </div>
    </div>
  );
};

export default App;