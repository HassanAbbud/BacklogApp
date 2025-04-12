/* eslint-disable @next/next/no-img-element */
'use client';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect, FormEvent } from 'react'; // Added FormEvent
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message';
import { useUserStore } from '../stores/userStore';
import { ProgressSpinner } from 'primereact/progressspinner';
import styles from './Login.module.css';


interface User {
    id: string;
    username: string;
    email: string;
    // Add other user properties 
}


interface LayoutContextType {
    layoutConfig: {
        inputStyle?: string;
        colorScheme?: string;
        // Add other layout config properties
    };
    // Add other context properties/methods
}

// Define the shape of the useUserStore hook return value
interface UserStoreType {
    user: User | null;
    setUser: (user: User | null) => void;
    // Add other store properties/methods
}


const LoginPage = () => {
    // --- State Variables ---
    const [rightPanelActive, setRightPanelActive] = useState(false); // Controls which panel (login/signup) is active
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [checked, setChecked] = useState(false); // Remember me checkbox
    const [error, setError] = useState(''); // General error message for login/signup failures
    const [loading, setLoading] = useState(false); // Indicates if an API call is in progress
    const [formErrors, setFormErrors] = useState({ // Stores specific field validation errors
        email: '',
        password: '',
        username: ''
    });


    // --- Hooks ---
    // Use type assertion if the context/store types are not strictly defined elsewhere
    const { layoutConfig } = useContext(LayoutContext) as LayoutContextType;
    const router = useNavigate();
    const { setUser, user } = useUserStore() as UserStoreType;


    // --- Effects ---
    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            router('/'); // Redirect to home page or dashboard
        }
    }, [user, router]);


    // Clear errors and form validation messages when switching panels
    useEffect(() => {
        setError(''); // Clear general API errors
        setFormErrors({ email: '', password: '', username: '' }); // Clear field validation errors
    }, [rightPanelActive]); // Run this effect when the active panel changes

    // --- Validation ---
    const validateForm = (isLogin: boolean): boolean => {
        const errors = { email: '', password: '', username: '' };
        let isValid = true;

        const email = isLogin ? loginEmail : registerEmail;
        const password = isLogin ? loginPassword : registerPassword;

        // Username validation (only for registration)
        if (!isLogin) {
            if (!registerUsername.trim()) {
                errors.username = 'Username is required';
                isValid = false;
            }
        }

        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            // Basic email format check
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            // Example: Minimum password length
            errors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }

        setFormErrors(errors); // Update the state with any validation errors
        return isValid; // Return true if no errors were found
    };

    // --- Event Handlers ---
    // Handle login form submission
    const handleLoginSubmit = async (event?: FormEvent) => {
        event?.preventDefault(); // Prevent default browser form submission
        setError(''); // Clear previous errors


        if (!validateForm(true)) return; // Stop if validation fails

        setLoading(true); // Show loading indicator
        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw an error with the message from the API or a default message
                throw new Error(data.message || `Login failed with status: ${response.status}`);
            }

            // Assuming the API returns a token and user object upon successful login
            localStorage.setItem('token', data.token); // Store the token
            setUser(data.user); // Update user state
            router('/'); // Redirect to the main application page

        } catch (err: any) {
            console.error('Login error:', err);
            // Display the error message from the caught error
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false); // Hide loading indicator regardless of success or failure
        }
    };

    // Handle registration form submission
    const handleRegisterSubmit = async (event?: FormEvent) => {
        event?.preventDefault(); // Prevent default browser form submission
        setError(''); // Clear previous errors
        if (!validateForm(false)) return; // Stop if validation fails

        setLoading(true); // Show loading indicator
        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: registerUsername,
                    email: registerEmail,
                    password: registerPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw an error with the message from the API or a default message
                throw new Error(data.message || `Registration failed with status: ${response.status}`);
            }

            // Assuming the API returns a token and user object upon successful registration
            localStorage.setItem('token', data.token); // Store the token
            setUser(data.user); // Update user state
            router('/'); // Redirect to the main application page

        } catch (err: any) {
            console.error('Registration error:', err);
            // Display the error message from the caught error
            setError(err.message || 'An unexpected error occurred during registration.');
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };









    // --- Render Logic ---
    return (
        // Outermost container for centering the login box on the page
        <div className={classNames(
            'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
            // Apply PrimeReact input style class if needed
            { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
        )}>
            {/* Container for the logo and the main login/signup component */}
            <div className="flex flex-column align-items-center justify-content-center">
                {/* Application Logo */}
                <img
                    src="/Images/Logo.png" // This is the path used in the code
                    alt="Application Logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />


                {/* Main container for the sliding panels */}
                {/* The 'rightPanelActive' class controls the state via CSS */}
                <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`}>

                    {/* Sign-In Panel */}
                    <div className={styles.signInContainer}>
                        <form className={styles.form} onSubmit={handleLoginSubmit} noValidate> {/* Added noValidate to rely on custom validation */}
                            <h1 className={styles.title}>Sign In</h1>

                            {/* Display general login error only when this panel is active */}
                            {error && !rightPanelActive && (
                                <Message severity="error" text={error} className={styles.errorMessage} />
                            )}

                            {/* Display loading spinner only when this panel is active and loading */}
                            {loading && !rightPanelActive && (
                                <div className={styles.spinnerContainer}>
                                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                                </div>
                            )}

                            {/* Email Input */}
                            <InputText
                                id="loginEmail" // Added id for label association
                                type="email" // Use type="email" for better semantics and mobile keyboards
                                placeholder="Email"
                                // Apply invalid class only if there's an email error AND login is active
                                className={classNames(styles.input, { 'p-invalid': formErrors.email && !rightPanelActive })}
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                disabled={loading} // Disable input while loading
                                aria-describedby="loginEmail-error" // Link to error message for accessibility
                            />
                            {/* Display email validation error only if it exists AND login is active */}
                            {formErrors.email && !rightPanelActive && <small id="loginEmail-error" className="p-error block">{formErrors.email}</small>}

                            {/* Password Input */}
                            <div className={styles.passwordContainer}>
                                <Password
                                    id="loginPassword" // Added id
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="Password"
                                    toggleMask // Allow user to show/hide password
                                    // Apply invalid class only if there's a password error AND login is active
                                    className={classNames({ 'p-invalid': formErrors.password && !rightPanelActive })}
                                    inputClassName={styles.passwordInput} // Style the internal input
                                    feedback={false} // Don't show password strength meter on login
                                    disabled={loading} // Disable while loading
                                    aria-describedby="loginPassword-error" // Link to error message
                                />
                            </div>
                            {/* Display password validation error only if it exists AND login is active */}
                            {formErrors.password && !rightPanelActive && <small id="loginPassword-error" className="p-error block">{formErrors.password}</small>}

                            {/* Remember Me & Forgot Password */}
                            <div className=" justify-content-between  mt-2 mb-4">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="rememberme"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.checked ?? false)}
                                        className="mr-2"
                                        disabled={loading}
                                    />
                                    <label htmlFor="rememberme">Remember me</label>
                                </div>
                                {/* Make "Forgot password?" a button or link for future functionality */}
                                <a className={styles.anchor} style={{ cursor: 'pointer' }} onClick={() => {/* Implement forgot password logic */ }}>
                                    Forgot password?
                                </a>
                            </div>

                            {/* Sign In Button */}
                            <Button
                                label="Sign In"
                                type="submit" // Trigger form submission
                                className={styles.authButton}
                                disabled={loading} // Disable button while loading
                            />
                        </form>
                    </div>

                    {/* Sign-Up Panel */}
                    <div className={styles.signUpContainer}>
                        <form className={styles.form} onSubmit={handleRegisterSubmit} noValidate> {/* Added noValidate */}
                            <h1 className={styles.title}>Create Account</h1>

                            {/* Display general registration error only when this panel is active */}
                            {error && rightPanelActive && (
                                <Message severity="error" text={error} className={styles.errorMessage} />
                            )}

                            {/* Display loading spinner only when this panel is active and loading */}
                            {loading && rightPanelActive && (
                                <div className={styles.spinnerContainer}>
                                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                                </div>
                            )}

                            {/* Username Input */}
                            <InputText
                                id="registerUsername"
                                type="text"
                                placeholder="Username"
                                className={classNames(styles.input, { 'p-invalid': formErrors.username && rightPanelActive })}
                                value={registerUsername}
                                onChange={(e) => setRegisterUsername(e.target.value)}
                                disabled={loading}
                                aria-describedby="registerUsername-error"
                            />
                            {formErrors.username && rightPanelActive && <small id="registerUsername-error" className="p-error block">{formErrors.username}</small>}

                            {/* Email Input */}
                            <InputText
                                id="registerEmail"
                                type="email"
                                placeholder="Email"
                                className={classNames(styles.input, { 'p-invalid': formErrors.email && rightPanelActive })}
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                disabled={loading}
                                aria-describedby="registerEmail-error"
                            />
                            {formErrors.email && rightPanelActive && <small id="registerEmail-error" className="p-error block">{formErrors.email}</small>}

                            {/* Password Input */}
                            <div className={styles.passwordContainer}>
                                <Password
                                    id="registerPassword"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    placeholder="Password"
                                    toggleMask
                                    className={classNames({ 'p-invalid': formErrors.password && rightPanelActive })}
                                    inputClassName={styles.passwordInput}
                                    feedback // Show strength meter for registration
                                    disabled={loading}
                                    aria-describedby="registerPassword-error"
                                />
                            </div>
                            {formErrors.password && rightPanelActive && <small id="registerPassword-error" className="p-error block">{formErrors.password}</small>}

                            {/* Sign Up Button */}
                            <Button
                                label="Sign Up"
                                type="submit" // Trigger form submission
                                className={styles.authButton}
                                disabled={loading} // Disable button while loading
                            />
                        </form>
                    </div>

                    {/* Overlay Container (Holds the sliding panels with text) */}
                    <div className={styles.overlayContainer}>
                        <div className={styles.overlay}>
                            {/* Left Overlay Panel (Visible when Sign Up form is active) */}
                            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
                                <h1 className={styles.title}>Welcome Back!</h1>
                                <p className={styles.paragraph}>
                                    Already have an account? Sign in to continue your journey.
                                </p>
                                <Button
                                    label="Sign In"
                                    className={styles.ghostButton} // Style as a ghost button
                                    onClick={() => setRightPanelActive(false)} // Switch to show Sign In form
                                />
                            </div>
                            {/* Right Overlay Panel (Visible when Sign In form is active) */}
                            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
                                <h1 className={styles.title}>Hello, Friend!</h1>
                                <p className={styles.paragraph}>
                                    New here? Enter your details and start your journey with us.
                                </p>
                                <Button
                                    label="Sign Up"
                                    className={styles.ghostButton} // Style as a ghost button
                                    onClick={() => setRightPanelActive(true)} // Switch to show Sign Up form
                                />
                            </div>
                        </div>
                    </div>
                </div> {/* End of main container */}
            </div> {/* End of logo + main container wrapper */}
        </div> // End of outermost centering container
    );
};

export default LoginPage; // Export the component for use
