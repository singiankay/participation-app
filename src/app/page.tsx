"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    participation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="main-container">
      {/* Header */}
      <header className="header-main">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-fields-container">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="form-field"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="form-field"
            />
            <input
              type="number"
              name="participation"
              placeholder="Participation"
              value={formData.participation}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              className="form-field"
            />
             <button
            type="submit"
            className="submit-button"
          >
            SEND
          </button>
          </div>
        </form>
      </header>

      {/* Body */}
      <main className="content-main">
        {/* Centered title and description */}
        <div className="title-section">
          <h1 className="main-title">
            DATA
          </h1>
          <p className="main-description">
            Manage and track participation percentages for team members. 
            Add new participants and view the distribution in real-time.
          </p>
        </div>

        {/* Content area - will contain table and chart later */}
        <div className="content-grid">
          {/* Left side - Table placeholder */}
          <div className="card-base">
            <h2 className="card-title">Participation Table</h2>
            <p className="card-placeholder">Table will be implemented later</p>
          </div>

          {/* Right side - Chart placeholder */}
          <div className="card-base">
            <h2 className="card-title">Participation Chart</h2>
            <p className="card-placeholder">Pie chart will be implemented later</p>
          </div>
        </div>
      </main>
    </div>
  );
}
