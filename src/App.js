import React, { useState, useEffect } from 'react';
import GraphemeSplitter from 'grapheme-splitter';
import './App.css';

const splitter = new GraphemeSplitter();

function App() {
    const [wordList, setWordList] = useState([]);
    const [originalWord, setOriginalWord] = useState('');
    const [shuffledTiles, setShuffledTiles] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        // Fetch the .txt file when app loads
        fetch('/tamil_words.txt')
            .then((res) => res.text())
            .then((text) => {
                const words = text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);
                setWordList(words);
                getNewWord(words);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error loading words:', error);
                setMessage('சொற்களை ஏற்றுவதில் பிழை ஏற்பட்டது');
                setIsLoading(false);
            });
    }, []);

    const shuffleWord = (word) => {
        // Ensure proper splitting of Tamil characters
        const graphemes = splitter.splitGraphemes(word);
        
        // Debug log to check proper splitting
        console.log('Original graphemes:', graphemes);
        
        // If word is too short, just return a simple shuffle
        if (graphemes.length <= 2) {
            return graphemes.sort(() => Math.random() - 0.5);
        }

        // Keep shuffling until we get a different arrangement
        let shuffled;
        let isSameWord;
        let hasTooManySamePositions;
        let attempts = 0;
        const MAX_ATTEMPTS = 10;
        
        do {
            shuffled = [...graphemes];
            // Fisher-Yates shuffle algorithm
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            // Check if the shuffled word is different enough from original
            isSameWord = shuffled.join('') === word;
            hasTooManySamePositions = shuffled.filter((char, i) => char === graphemes[i]).length > graphemes.length / 2;
            
            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
                // If we can't get a good shuffle after max attempts, just return the last attempt
                console.log('Max shuffle attempts reached');
                break;
            }
        } while (isSameWord || hasTooManySamePositions);

        // Debug log to check shuffled result
        console.log('Shuffled graphemes:', shuffled);
        return shuffled;
    };

    const getNewWord = (list = wordList) => {
        setIsCorrect(false);
        const word = list[Math.floor(Math.random() * list.length)];
        console.log('Selected word:', word); // Debug log
        setOriginalWord(word);
        const shuffledWord = shuffleWord(word);
        setShuffledTiles(shuffledWord);
        setSelectedTiles([]);
        setMessage('');
    };

    const selectTile = (letter, index) => {
        if (selectedTiles.find((t) => t.index === index)) return;
        const newSelectedTiles = [...selectedTiles, { letter, index }];
        setSelectedTiles(newSelectedTiles);
        
        // Auto-submit if all letters are selected
        if (newSelectedTiles.length === splitter.splitGraphemes(originalWord).length) {
            submitGuess(newSelectedTiles);
        }
    };

    const removeTile = (index) => {
        setSelectedTiles(selectedTiles.filter((_, i) => i !== index));
    };

    const submitGuess = (tiles = selectedTiles) => {
        const guess = tiles.map((t) => t.letter).join('');
        if (guess === originalWord) {
            setIsCorrect(true);
            setMessage(`✨ அருமை! சரியான பதில்! (${originalWord})`);
            setScore(score + 1);
            setTimeout(() => getNewWord(), 1500);
        } else {
            setMessage('❌ தவறு, மீண்டும் முயற்சிக்கவும்!');
            // Shake animation will be triggered by CSS
            const guessRow = document.querySelector('.guess-row');
            guessRow.classList.add('shake');
            setTimeout(() => guessRow.classList.remove('shake'), 500);
        }
    };

    if (isLoading) {
        return (
            <div className="app">
                <div className="loading">
                    ஏற்றுகிறது...
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <h1>🎮 சொற்ப் பிறழ் 🎮</h1>
            <div className="score">
                <span>மதிப்பெண்கள்:</span> 
                <span className="score-number">{score}</span>
            </div>

            <div className={`tile-row ${isCorrect ? 'correct' : ''}`}>
                {shuffledTiles.map((letter, idx) => (
                    <div
                        key={idx}
                        className={`tile ${
                            selectedTiles.find((t) => t.index === idx) ? 'disabled' : ''
                        }`}
                        onClick={() => selectTile(letter, idx)}
                    >
                        {letter}
                    </div>
                ))}
            </div>

            <h3>உங்கள் பதில்:</h3>
            <div className="tile-row guess-row">
                {selectedTiles.map((tile, i) => (
                    <div
                        key={i}
                        className="tile selected"
                        onClick={() => removeTile(i)}
                    >
                        {tile.letter}
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button 
                    onClick={() => submitGuess()}
                    disabled={selectedTiles.length === 0}
                >
                    சரிபார்
                </button>
                <button 
                    className="secondary" 
                    onClick={() => getNewWord()}
                >
                    புதிய சொல்
                </button>
            </div>
            
            <p className={`message ${isCorrect ? 'correct' : ''}`}>{message}</p>
        </div>
    );
}

export default App;
