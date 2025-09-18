import React, { useState } from 'react';
import './StartPage.css';

function StartPage({ onStartGame }) {
    const [showRules, setShowRules] = useState(true);
    return (
        <div className="start-page">
            <h1>
                <span className="title-row">
                    <img src={`${process.env.PUBLIC_URL}/tamil.png`} alt="Tamil Logo" className="title-logo" />
                    தமிழ்ப்பிறழ்
                </span>
            </h1>
            <button 
                className="collapsible-toggle" 
                onClick={() => setShowRules(!showRules)}
            >
                {showRules ? 'விதிகளை மறை' : 'விதிகளை காட்டு'}
            </button>
            <div className={`rules-container collapsible-content ${showRules ? 'open' : 'closed'}`}>
            <h2>விளையாட்டு விதிகள்</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-800">
                <li>கலைக்கப்பட்ட தமிழ் சொற்கள் காட்டப்படும்</li>
                <li>எழுத்துகளை சரியான வரிசையில் அமைக்க வேண்டும்</li>
                <li>எழுத்துகளை தேர்வு செய்ய அவற்றை கிளிக் செய்யவும்</li>
                <li>தவறான எழுத்தை நீக்க, அதை மீண்டும் கிளிக் செய்யவும்</li>
                <li>சரியான சொல்லுக்கு ஒரு மதிப்பெண் கிடைக்கும்</li>
            </ul>
            
            <h3>நிலைகள்</h3>
            <ul class="space-y-3 list-disc list-inside text-gray-800">
            <li>
            <strong>அடிப்படை நிலை</strong>
            <br></br>5 அல்லது அதற்கும் குறைவான எழுத்துகள் கொண்ட சொற்கள்
            </li>
            <li>
            <strong>மேம்பட்ட நிலை</strong>
            <br></br>
            5-க்கும் மேற்பட்ட எழுத்துகள் கொண்ட சொற்கள்
            </li>
            </ul>

                <div className="example">
                    <h3>எடுத்துக்காட்டு</h3>
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