import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '@/redux/actions/userActions';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ email, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded p-2 w-full mb-4"
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded p-2 w-full mb-4"
        placeholder="Password"
        required
      />
      <button
        type="submit"
        className="bg-green-500 text-white rounded p-2 hover:bg-green-600 transition duration-300"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;