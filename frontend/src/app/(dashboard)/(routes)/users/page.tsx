"use client";
import { useState } from "react";

export default function Users() {
  const [authToken, setAuthToken] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8000/users", {
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    });
    const data = await response.json();
    setUsers(data.users);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl">User List</h1>
      <input
        type="text"
        placeholder="Enter Auth "
        value={authToken}
        onChange={(e) => setAuthToken(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={fetchUsers} className="bg-blue-500 text-white p-2 mt-2">
        Fetch Users
      </button>

      <ul className="mt-4">
        {users.map((user) => (
          <li key={user.id} className="border-b p-2">
            <p>{user.name}</p>
            <p>Posts: {user.postCount}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
