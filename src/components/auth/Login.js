import React from 'react';
import { useApp } from '../../context/AppContext';
import './Login.css';
import logo from '../../assets/ReleaseTrack_Pro logo.png';

const Login = () => {
    const { signInWithGoogle } = useApp();

    const handleLogin = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                console.error('Error logging in:', error.message);
            }
        } catch (error) {
            console.error('Error logging in:', error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={logo} alt="ReleaseTrack Pro Logo" className="login-logo" />
                <h1>ReleaseTrack Pro</h1>
                <p>Please sign in to continue</p>
                <button onClick={handleLogin} className="google-signin-button">
                    <img src="/google-logo.svg" alt="Google logo" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
