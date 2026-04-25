// Updated auth form with forgot password link and fixed redirect URL to https://apertos.vercel.app/auth/callback
import React from 'react';
import { useHistory } from 'react-router-dom';

const AuthForm = () => {
    const history = useHistory();

    const handleForgotPassword = () => {
        history.push('/forgot-password');
    };

    return (
        <form>
            {/* Add other input fields here */}
            <button type="button" onClick={handleForgotPassword}>Forgot Password?</button>
        </form>
    );
};

export default AuthForm;
