// Forgot password form that sends reset email to https://apertos.vercel.app/auth/reset-password
import React, { useState } from 'react';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Add logic to send reset email
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <button type="submit">Send Reset Email</button>
        </form>
    );
};

export default ForgotPasswordForm;
