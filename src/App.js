import React, { useState, useEffect, useCallback } from 'react';
import GraphemeSplitter from 'grapheme-splitter';
import StartPage from './components/StartPage';
import './App.css';

const splitter = new GraphemeSplitter();

function App() {
    const [wordList, setWordList] = useState([]);
    const [originalWord, setOriginalWord] = useState('');
    const [shuffledTiles, setShuffledTiles] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]); // used as slot array (null or {letter,index})
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameLevel, setGameLevel] = useState(null);
    const [hintsUsed, setHintsUsed] = useState(0);

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
        // initialize slots to the length of the target word
        const slots = Array(splitter.splitGraphemes(word).length).fill(null);
        setSelectedTiles(slots);
        setMessage('');
        setHintsUsed(0);
    }, [getFilteredWords, shuffleWord]);

    const handleStartGame = (level) => {
        setGameLevel(level);
        setGameStarted(true);
        setScore(0);
        setHintsUsed(0);
    };

    // Add useEffect to handle game level changes
    useEffect(() => {
        if (gameStarted && gameLevel !== null) {
            getNewWord();
        }
    }, [gameLevel, gameStarted, getNewWord]);

    const selectTile = (letter, index, targetSlotIndex = null) => {
        // prevent using same tile twice
        if (selectedTiles.some((t) => t && t.index === index)) return;

        const newSlots = [...selectedTiles];
        let slotIndex = targetSlotIndex;
        if (slotIndex === null) {
            slotIndex = newSlots.findIndex((s) => s === null);
        }
        if (slotIndex === -1) return; // no space

        newSlots[slotIndex] = { letter, index };
        setSelectedTiles(newSlots);

        // Auto-submit if all filled
        if (newSlots.every((s) => s !== null)) {
            submitGuess(newSlots);
        }
    };

    const removeTile = (slotIndex) => {
        const newSlots = [...selectedTiles];
        newSlots[slotIndex] = null;
        setSelectedTiles(newSlots);
    };

    const submitGuess = (tiles = selectedTiles) => {
        if (!tiles.length || tiles.some((t) => t === null)) return;
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

    const useHint = () => {
        if (gameLevel !== 'advanced') {
            setMessage('குறிப்புகள் மேம்பட்ட நிலைக்கு மட்டுமே கிடைக்கும்');
            return;
        }
        if (hintsUsed >= 2) {
            setMessage('இரண்டு குறிப்புகள் ஏற்கெனவே பயன்படுத்தப்பட்டுள்ளன');
            return;
        }
        if (!originalWord) return;

        const targetGraphemes = splitter.splitGraphemes(originalWord);
        const emptySlots = selectedTiles
            .map((s, i) => (s === null ? i : null))
            .filter((i) => i !== null);
        if (emptySlots.length === 0) return;
        // pick a random empty slot to reveal
        const slotIndexToFill = emptySlots[Math.floor(Math.random() * emptySlots.length)];

        const needed = targetGraphemes[slotIndexToFill];
        const usedIdx = new Set(selectedTiles.filter((s) => s !== null).map((t) => t.index));
        const tileIdx = shuffledTiles.findIndex((ch, idx) => ch === needed && !usedIdx.has(idx));

        if (tileIdx === -1) {
            setMessage('குறிப்பு கிடைக்கவில்லை');
            return;
        }

        // Select the correct next tile and update hint/score
        selectTile(needed, tileIdx, slotIndexToFill);
        setHintsUsed(hintsUsed + 1);
        setScore(Math.max(0, score - 5));
        setMessage(`💡 குறிப்பு பயன்படுத்தப்பட்டது: இடம் ${slotIndexToFill + 1} வெளிப்படுத்தப்பட்டது (-5)`);
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

            <div 
                className={`tile-row ${isCorrect ? 'correct' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    const data = e.dataTransfer.getData('text/plain');
                    if (data.startsWith('slot:')) {
                        const from = parseInt(data.split(':')[1], 10);
                        // dropping to bank removes from slot
                        removeTile(from);
                    }
                }}
            >
                {shuffledTiles.map((letter, idx) => {
                    const used = selectedTiles.some((t) => t && t.index === idx);
                    return (
                        <div
                            key={idx}
                            className={`tile ${used ? 'disabled' : ''}`}
                            draggable={!used}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', `bank:${idx}`);
                            }}
                            onClick={() => selectTile(letter, idx)}
                        >
                            {letter}
                        </div>
                    );
                })}
            </div>

            <h3>உங்கள் பதில்:</h3>
            <div className="tile-row guess-row">
                {selectedTiles.map((slot, i) => (
                    <div
                        key={i}
                        className={`slot ${slot ? 'filled' : 'empty'}`}
                        onClick={() => slot && removeTile(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            const data = e.dataTransfer.getData('text/plain');
                            if (!data) return;
                            if (data.startsWith('bank:')) {
                                const tileIdx = parseInt(data.split(':')[1], 10);
                                const letter = shuffledTiles[tileIdx];
                                selectTile(letter, tileIdx, i);
                            } else if (data.startsWith('slot:')) {
                                const from = parseInt(data.split(':')[1], 10);
                                if (from === i) return;
                                const newSlots = [...selectedTiles];
                                const tmp = newSlots[i];
                                newSlots[i] = newSlots[from];
                                newSlots[from] = tmp;
                                setSelectedTiles(newSlots);
                            }
                        }}
                    >
                        {slot ? (
                            <div
                                className="tile selected"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', `slot:${i}`);
                                }}
                            >
                                {slot.letter}
                            </div>
                        ) : (
                            <div className="placeholder"> </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="button-group">
                {gameLevel === 'advanced' && (
                    <button 
                        className="hint" 
                        onClick={useHint}
                        disabled={
                            hintsUsed >= 2 ||
                            (selectedTiles && selectedTiles.length > 0 && selectedTiles.every((s) => s !== null))
                        }
                    >
                        குறிப்பு ({2 - hintsUsed} மீதம்)
                    </button>
                )}
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
            {message && message.trim() !== '' && (
                <p className={`message ${isCorrect ? 'correct' : ''}`}>{message}</p>
            )}
        </div>
    );
}

export default App;
