'use client';
import { useNavigate } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { useUserStore } from '../stores/userStore';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoginPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({
        email: '',
        password: '',
        username: ''
    });

    // context and router
    const { layoutConfig } = useContext(LayoutContext);
    const router = useNavigate();
    const { setUser, user } = useUserStore();

    // redirect if logined in
    useEffect(() => {
        if (user) {
            router('/');
        }
    }, [user, router]);

    // styles
    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    // form validation
    const validateForm = (isLogin: boolean) => {
        const errors = {
            email: '',
            password: '',
            username: ''
        };

        if (!isLogin && !registerUsername.trim()) {
            errors.username = 'Username is required';
        }

        const email = isLogin ? loginEmail : registerEmail;
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        const password = isLogin ? loginPassword : registerPassword;
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    // handle login and register
    const handleLogin = async () => {
        setError('');
        if (!validateForm(true)) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            setUser(data.user);
            router('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError('');
        if (!validateForm(false)) return;

        setLoading(true);
        try {
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
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            setUser(data.user);
            router('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // rendering
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img
                    src={`/LogoCircle.png`}
                    alt="Logo"
                    className="mb-5 w-6rem flex-shrink-0"
                />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">                        
                            <div className="text-900 text-3xl font-medium mb-3">
                                {activeIndex === 0 ? 'Welcome Back!' : 'Create Account'}
                            </div>
                            <span className="text-600 font-medium">
                                {activeIndex === 0 ? 'Sign in to continue' : 'Register to get started'}
                            </span>
                        </div>

                        {error && (
                            <Message severity="error" text={error} className="w-full mb-4" />
                        )}

                        {loading && (
                            <div className="flex justify-content-center mb-4">
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                            </div>
                        )}

                        <TabView
                            activeIndex={activeIndex}
                            onTabChange={(e) => {
                                setActiveIndex(e.index);
                                setError('');
                                setFormErrors({ email: '', password: '', username: '' });
                            }}
                        >
                            {/* login tab*/}
                            <TabPanel header="Login">
                                <div>
                                    <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                        Email
                                    </label>
                                    <InputText
                                        id="email"
                                        type="text"
                                        placeholder="Email address"
                                        className={`w-full md:w-30rem mb-2 ${formErrors.email ? 'p-invalid' : ''}`}
                                        style={{ padding: '1rem' }}
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                    {formErrors.email && <small className="p-error block mb-3">{formErrors.email}</small>}

                                    <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                        Password
                                    </label>
                                    <Password
                                        inputId="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="Password"
                                        toggleMask
                                        className={`w-full mb-2 ${formErrors.password ? 'p-invalid' : ''}`}
                                        inputClassName="w-full p-3 md:w-30rem"
                                        feedback={false}
                                    />
                                    {formErrors.password && <small className="p-error block mb-3">{formErrors.password}</small>}

                                    <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                        <div className="flex align-items-center">
                                            <Checkbox
                                                inputId="rememberme"
                                                checked={checked}
                                                onChange={(e) => setChecked(e.checked ?? false)}
                                                className="mr-2"
                                            />
                                            <label htmlFor="rememberme">Remember me</label>
                                        </div>
                                        <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Button
                                        label="Sign In"
                                        className="w-full p-3 text-xl"
                                        onClick={handleLogin}
                                        disabled={loading}
                                    />
                                </div>
                            </TabPanel>

                            {/* register tab */}
                            <TabPanel header="Register">
                                <div>
                                    <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                        Username
                                    </label>
                                    <InputText
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        className={`w-full md:w-30rem mb-2 ${formErrors.username ? 'p-invalid' : ''}`}
                                        style={{ padding: '1rem' }}
                                        value={registerUsername}
                                        onChange={(e) => setRegisterUsername(e.target.value)}
                                    />
                                    {formErrors.username && <small className="p-error block mb-3">{formErrors.username}</small>}

                                    <label htmlFor="registerEmail" className="block text-900 text-xl font-medium mb-2">
                                        Email
                                    </label>
                                    <InputText
                                        id="registerEmail"
                                        type="text"
                                        placeholder="Email address"
                                        className={`w-full md:w-30rem mb-2 ${formErrors.email ? 'p-invalid' : ''}`}
                                        style={{ padding: '1rem' }}
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                    />
                                    {formErrors.email && <small className="p-error block mb-3">{formErrors.email}</small>}

                                    <label htmlFor="registerPassword" className="block text-900 font-medium text-xl mb-2">
                                        Password
                                    </label>
                                    <Password
                                        inputId="registerPassword"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        placeholder="Password"
                                        toggleMask
                                        className={`w-full mb-2 ${formErrors.password ? 'p-invalid' : ''}`}
                                        inputClassName="w-full p-3 md:w-30rem"
                                        feedback
                                    />
                                    {formErrors.password && <small className="p-error block mb-3">{formErrors.password}</small>}

                                    <Button
                                        label="Register"
                                        className="w-full p-3 text-xl"
                                        onClick={handleRegister}
                                        disabled={loading}
                                    />
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;