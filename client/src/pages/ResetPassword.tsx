import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ResetPassword = () => {
  const { token } = useParams();
  console.log("Reset token from URL:", token);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');

      if (!token) {
          setError('Invalid or missing reset token.');
          setLoading(false);
          return;
      }

      if (!password) {
          setError('Please enter a new password.');
          setLoading(false);
          return;
      }

    try {
      const res = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      <InputText
        placeholder="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3"
      />
      {message && <div className="text-green-500 mb-2">{message}</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <Button label={loading ? 'Resetting...' : 'Reset Password'} onClick={handleReset} className="w-full" />
    </div>
  );
};

export default ResetPassword;
