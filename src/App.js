import React, { useState, useEffect, useCallback } from 'react';
import GraphemeSplitter from 'grapheme-splitter';
import StartPage from './components/StartPage';
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
    const [gameStarted, setGameStarted] = useState(false);
    const [gameLevel, setGameLevel] = useState(null);

    useEffect(() => {
        // Fetch the .txt file when app loads
        fetch(`${process.env.PUBLIC_URL}/tamil_words.txt`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to load words file');
                }
                return res.text();
            })
            .then((text) => {
                if (!text || text.trim().length === 0) {
                    throw new Error('Words file is empty');
                }
                const words = text
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);
                
                if (words.length === 0) {
                    throw new Error('No valid words found in file');
                }
                
                setWordList(words);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error loading words:', error);
                setMessage('சொற்களை ஏற்றுவதில் பிழை ஏற்பட்டது');
                setIsLoading(false);
            });
    }, []);

    const getFilteredWords = useCallback(() => {
        if (!wordList.length) return [];
                
        return wordList.filter(word => {
            const graphemes = splitter.splitGraphemes(word);
            const graphemeCount = graphemes.length;
            
            let isIncluded = false;
            if (gameLevel === 'basic' || gameLevel === null) {
                isIncluded = graphemeCount <= 5;
            } else {
                isIncluded = graphemeCount > 5;
            }
            return isIncluded;
        });
    }, [wordList, gameLevel]);

    const shuffleWord = useCallback((word) => {
        if (!word) {
            console.error('No word provided to shuffle');
            return [];
        }

        // Ensure proper splitting of Tamil characters
        const graphemes = splitter.splitGraphemes(word);
        
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
                console.log('Max shuffle attempts reached');
                break;
            }
        } while (isSameWord || hasTooManySamePositions);

        return shuffled;
    }, []);

    const getNewWord = useCallback(() => {
        setIsCorrect(false);
        const filteredWords = getFilteredWords();
        
        if (!filteredWords.length) {
            console.error('No words available for this level');
            setMessage('இந்த நிலைக்கான சொற்கள் கிடைக்கவில்லை');
            return;
        }
        const word = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        setOriginalWord(word);
        const shuffledWord = shuffleWord(word);
        setShuffledTiles(shuffledWord);
        setSelectedTiles([]);
        setMessage('');
    }, [getFilteredWords, shuffleWord]);

    const handleStartGame = (level) => {
        setGameLevel(level);
        setGameStarted(true);
        setScore(0);
    };

    // Add useEffect to handle game level changes
    useEffect(() => {
        if (gameStarted && gameLevel !== null) {
            getNewWord();
        }
    }, [gameLevel, gameStarted, getNewWord]);

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
            setMessage(`✨ அருமை! சரியான பதில்! (${originalWord}) +10 புள்ளிகள்`);
            setScore(score + 10);
            setTimeout(() => getNewWord(), 1500);
        } else {
            setMessage('❌ தவறு, மீண்டும் முயற்சிக்கவும்! -3 புள்ளிகள்');
            // Never let score go below 0
            setScore(Math.max(0, score - 3));
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

    if (!gameStarted) {
        return <StartPage onStartGame={handleStartGame} />;
    }

    return (
        <div className="app">
            <h1>
                <span className="title-row">
                    <img src={`${process.env.PUBLIC_URL}/tamil.png`} alt="Tamil Logo" className="title-logo" />
                    தமிழ்ப்பிறழ்
                </span>
            </h1>
            <div className="game-info">
                <div className="level-indicator">
                    {gameLevel === 'basic' ? 'அடிப்படை நிலை' : 'மேம்பட்ட நிலை'}
                </div>
                <div className="score">
                    <span>மதிப்பெண்கள்:</span> 
                    <span className="score-number">{score}</span>
                </div>
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
                <button 
                    className="tertiary" 
                    onClick={() => {
                        setGameStarted(false);
                        setGameLevel(null);
                        setScore(0);
                    }}
                >
                    நிலையைத் தேர்வு செய்
                </button>
            </div>
            
            <p className={`message ${isCorrect ? 'correct' : ''}`}>{message}</p>
        </div>
    );
}

export default App;
