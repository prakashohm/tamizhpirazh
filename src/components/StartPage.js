import React, { useState } from 'react';
import './StartPage.css';

function StartPage({ onStartGame }) {
    const [showRules, setShowRules] = useState(true);
    return (
        <div className="start-page">
            <h1>🎮 தமிழ்ப் பிறழ் 🎮</h1>
            <button 
                className="collapsible-toggle" 
                onClick={() => setShowRules(!showRules)}
            >
                {showRules ? 'விதிகளை மறை' : 'விதிகளை காட்டு'}
            </button>
            <div className={`rules-container collapsible-content ${showRules ? 'open' : 'closed'}`}>
                <h2>விளையாட்டு விதிகள்</h2>
                
                <div className="rule-item">
                    <span className="rule-number">1</span>
                    <p>கலைக்கப்பட்ட தமிழ் சொற்கள் காட்டப்படும்</p>
                </div>

                <div className="rule-item">
                    <span className="rule-number">2</span>
                    <p>எழுத்துகளை சரியான வரிசையில் அமைக்க வேண்டும்</p>
                </div>

                <div className="rule-item">
                    <span className="rule-number">3</span>
                    <p>எழுத்துகளை தேர்வு செய்ய அவற்றை கிளிக் செய்யவும்</p>
                </div>

                <div className="rule-item">
                    <span className="rule-number">4</span>
                    <p>தவறான எழுத்தை நீக்க, அதை மீண்டும் கிளிக் செய்யவும்</p>
                </div>

                <div className="rule-item">
                    <span className="rule-number">5</span>
                    <p>சரியான சொல்லுக்கு ஒரு மதிப்பெண் கிடைக்கும்</p>
                </div>

                <div className="levels-container">
                    <h3>நிலைகள்:</h3>
                    <div className="level-description">
                        <h4>அடிப்படை நிலை:</h4>
                        <p>5 அல்லது அதற்கும் குறைவான எழுத்துகள் கொண்ட சொற்கள்</p>
                    </div>
                    <div className="level-description">
                        <h4>மேம்பட்ட நிலை:</h4>
                        <p>5-க்கும் மேற்பட்ட எழுத்துகள் கொண்ட சொற்கள்</p>
                    </div>
                </div>

                <div className="example">
                    <h3>எடுத்துக்காட்டு:</h3>
                    <div className="example-tiles">
                        <span className="tile">மி</span>
                        <span className="tile">த</span>
                        <span className="tile">ழ்</span>
                    </div>
                    <p>⬇️</p>
                    <div className="example-tiles correct">
                        <span className="tile">த</span>
                        <span className="tile">மி</span>
                        <span className="tile">ழ்</span>
                    </div>
                </div>
            </div>

            <div className="level-buttons">
                <button 
                    className="start-button basic" 
                    onClick={() => onStartGame('basic')}
                >
                    அடிப்படை நிலை
                </button>
                <button 
                    className="start-button advanced" 
                    onClick={() => onStartGame('advanced')}
                >
                    மேம்பட்ட நிலை
                </button>
            </div>
        </div>
    );
}

export default StartPage; 