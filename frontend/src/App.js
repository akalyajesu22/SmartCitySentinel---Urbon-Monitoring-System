import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './index.css';

const socket = io('http://localhost:5000');

function App() {
  const [issues, setIssues] = useState([]);
  const [formData, setFormData] = useState({ title: '', location: '', description: '' });
  const API_URL = 'http://localhost:5000/api/issues';

  const loadDashboard = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setIssues(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
    socket.on('new-incident-alert', (newIssue) => {
      setIssues((prevIssues) => [newIssue, ...prevIssues]);
    });
    return () => socket.off('new-incident-alert');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setFormData({ title: '', location: '', description: '' });
      }
    } catch (err) {
      alert('❌ Server Sync Failed.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏙️ Smart City Sentinel</h1>
        <p>MERN Stack Architecture with Socket.io WebSockets</p>
      </header>

      <div className="main-layout">
        <div className="control-card">
          <h2>⚠️ Log New Alert</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Issue Headline</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g., Water Pipeline Burst" required 
              />
            </div>
            <div className="input-group">
              <label>Target Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                placeholder="e.g., Gandhipuram, Ward 5" required 
              />
            </div>
            <div className="input-group">
              <label>Technical Details</label>
              <textarea 
                rows="4" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Provide micro infrastructure data updates..." required
              />
            </div>
            <button type="submit" className="submit-btn">Transmit to Control Center</button>
          </form>
        </div>

        <div className="control-card">
          <h2>📊 Central Live Active Database Feed (WebSockets Connected)</h2>
          <div className="logs-stream">
            {issues.length === 0 ? (
              <p className="empty-msg">No active anomalies detected across sectors.</p>
            ) : (
              issues.map((issue) => (
                <div key={issue._id || Math.random()} className="log-node">
                  <div>
                    <h3>{issue.title}</h3>
                    <p className="meta-loc">📍 <b>Area:</b> {issue.location}</p>
                    <p className="body-desc">{issue.description}</p>
                  </div>
                  <span className="badge-alert">{issue.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;