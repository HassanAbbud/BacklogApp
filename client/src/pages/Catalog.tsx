import React from "react";
import { useNavigate } from "react-router-dom";
import "./Catalog.css";

const Catalog: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/signin-signup");
    };

    return (
        <div className="landing-page">
            <h1>Welcome to BacklogApp</h1>
            <p>Track your tasks and manage your backlog efficiently.</p>
            <button className="navigate-button" onClick={handleNavigate}>
                Get Started
            </button>
        </div>
    );
};

export default Catalog;