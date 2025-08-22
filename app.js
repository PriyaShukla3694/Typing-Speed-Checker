// TypeMaster Pro - Main Application Logic

// Application State Management
let gameState = {
    isActive: false,
    startTime: null,
    endTime: null,
    currentQuote: '',
    currentPosition: 0,
    errors: 0,
    totalChars: 0,
    timeLimit: 60,
    timer: null,
    currentUser: null,
    timeRemaining: 60,
    currentTheme: 'light'
};

// Quote Database with Multiple Categories
const quotes = {
    motivation: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts. The only impossible journey is the one you never begin. Believe you can and you're halfway there. Your limitation—it's only your imagination. Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones. Dream it. Wish it. Do it. Success doesn't just find you. You have to go out and get it. The harder you work for something, the greater you'll feel when you achieve it. Don't stop when you're tired. Stop when you're done.",
        "Wake up with determination. Go to bed with satisfaction. Do something today that your future self will thank you for. Little things make big days. It's going to be hard, but hard does not mean impossible. Don't wait for opportunity. Create it. You are never too old to set another goal."
    ],
    wisdom: [
        "The only true wisdom is in knowing you know nothing. In the middle of difficulty lies opportunity. It does not matter how slowly you go as long as you do not stop. The journey of a thousand miles begins with one step. Be yourself; everyone else is already taken. Yesterday is history, tomorrow is a mystery, today is a gift.",
        "The best time to plant a tree was twenty years ago. The second best time is now. A smooth sea never made a skilled sailor. Life is what happens to you while you're busy making other plans. The only way to do great work is to love what you do. If you are not willing to risk the usual, you will have to settle for ordinary.",
        "Happiness is not something ready made. It comes from your own actions. The mind is everything. What you think you become. Peace cannot be kept by force; it can only be achieved by understanding. In the end, we will remember not the words of our enemies, but the silence of our friends."
    ],
    technology: [
        "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life. Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. The science of today is the technology of tomorrow. Technology is nothing. What's important is that you have a faith in people.",
        "Any sufficiently advanced technology is indistinguishable from magic. The real problem is not whether machines think but whether men do. We are stuck with technology when what we really want is just stuff that works. Technology is a useful servant but a dangerous master. The great growling engine of change - technology.",
        "First we build the tools, then they build us. The Internet is becoming the town square for the global village of tomorrow. Technology empowers people to do what they want to do. It lets people be creative. It lets people be productive. It lets people learn things they didn't think they could learn before."
    ],
    literature: [
        "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. To be or not to be, that is the question. All that we see or seem is but a dream within a dream. It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.",
        "Call me Ishmael. Some years ago never mind how long precisely having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is the best of all possible worlds in this best of all possible worlds.",
        "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat. It was a hobbit hole, and that means comfort. The road goes ever on and on."
    ]
};

// Sample leaderboard data
let leaderboardData = [
    { name: "SpeedDemon", wpm: 125, accuracy: 98, date: new Date().toLocaleDateString() },
    { name: "KeyboardNinja", wpm: 118, accuracy: 96, date: new Date().toLocaleDateString() },
    { name: "TypeMaster", wpm: 112, accuracy: 99, date: new Date().toLocaleDateString() },
    { name: "QuickFingers", wpm: 108, accuracy: 94, date: new Date().toLocaleDateString() },
    { name: "RapidTyper", wpm: 105, accuracy: 97, date: new Date().toLocaleDateString() }
];

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadLeaderboard();
    loadTheme();
});

/**
 * Initialize the application
 */
function initializeApp() {
    updateTimerDisplay();
    resetStats();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    const typingInput = document.getElementById('typing-input');
    const timerSelect = document.getElementById('timer-select');
    
    // Typing input events
    typingInput.addEventListener('input', handleTyping);
    typingInput.addEventListener('paste', (e) => e.preventDefault());
    
    // Timer selection change
    timerSelect.addEventListener('change', function() {
        gameState.timeLimit = parseInt(this.value);
        gameState.timeRemaining = gameState.timeLimit;
        updateTimerDisplay();
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Close modals when clicking outside
    document.addEventListener('click', handleModalClicks);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    if (event.code === 'Escape' && gameState.isActive) {
        endTest();
    }
    
    if (event.code === 'Space' && event.ctrlKey && !gameState.isActive) {
        event.preventDefault();
        startTest();
    }
}

/**
 * Handle modal click events
 */
function handleModalClicks(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

/**
 * Start or stop the typing test
 */
function startTest() {
    if (gameState.isActive) {
        endTest();
        return;
    }

    // Reset game state
    gameState.isActive = true;
    gameState.startTime = Date.now();
    gameState.currentPosition = 0;
    gameState.errors = 0;
    gameState.totalChars = 0;
    gameState.timeRemaining = gameState.timeLimit;

    // Load and display quote
    loadQuote();
    
    // Enable input and focus
    const typingInput = document.getElementById('typing-input');
    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.placeholder = 'Type the text shown above. Watch the letters change color as you type!';
    typingInput.focus();

    // Update UI
    document.getElementById('start-btn').innerHTML = '<i class="fas fa-stop"></i> Stop Test';
    
    // Add visual effects
    const container = document.querySelector('.typing-container');
    container.classList.add('active');
    
    // Start timer
    startTimer();
}

/**
 * Load a random quote from the selected category
 */
function loadQuote() {
    const category = document.getElementById('category-select').value;
    const categoryQuotes = quotes[category];
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
    gameState.currentQuote = categoryQuotes[randomIndex];
    
    displayQuote();
}

/**
 * Display the quote with character spans
 */
function displayQuote() {
    const quoteElement = document.getElementById('quote-text');
    const chars = gameState.currentQuote.split('');
    
    // Create character spans with proper wrapping
    const charsHTML = chars.map((char, index) => {
        let className = 'char';
        
        if (index < gameState.currentPosition) {
            className = 'char correct';
        } else if (index === gameState.currentPosition) {
            className = 'char current';
        } else {
            className = 'char pending';
        }
        
        // Handle spaces properly
        const displayChar = char === ' ' ? '&nbsp;' : char;
        return `<span class="${className}" data-index="${index}">${displayChar}</span>`;
    }).join('');
    
    quoteElement.innerHTML = charsHTML;
    updateProgressBar();
}

/**
 * Update or create the progress bar
 */
function updateProgressBar() {
    let progressContainer = document.querySelector('.progress-container');
    if (!progressContainer) {
        const quoteDisplay = document.querySelector('.quote-display');
        progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = '<div class="progress-bar" id="progress-bar"></div>';
        quoteDisplay.insertBefore(progressContainer, quoteDisplay.firstChild);
    }
    
    const progressBar = document.getElementById('progress-bar');
    const progress = (gameState.currentPosition / gameState.currentQuote.length) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

/**
 * Handle typing input events
 */
function handleTyping(event) {
    if (!gameState.isActive) return;

    const typedText = event.target.value;
    
    gameState.currentPosition = typedText.length;
    gameState.totalChars = typedText.length;

    // Count errors
    gameState.errors = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] !== gameState.currentQuote[i]) {
            gameState.errors++;
        }
    }

    // Update display
    updateQuoteDisplay(typedText);
    updateStats();

    // Check if completed
    if (typedText === gameState.currentQuote) {
        endTest();
    }
}

/**
 * Update the visual display of the quote with typing progress
 */
function updateQuoteDisplay(typedText) {
    const quoteElement = document.getElementById('quote-text');
    const chars = gameState.currentQuote.split('');
    
    const charsHTML = chars.map((char, index) => {
        let className = 'char';
        
        if (index < typedText.length) {
            if (typedText[index] === char) {
                className = 'char correct';
            } else {
                className = 'char incorrect';
            }
        } else if (index === typedText.length) {
            className = 'char current';
        } else {
            className = 'char pending';
        }
        
        // Handle spaces properly and ensure proper wrapping
        const displayChar = char === ' ' ? '&nbsp;' : char;
        return `<span class="${className}" data-index="${index}">${displayChar}</span>`;
    }).join('');
    
    quoteElement.innerHTML = charsHTML;
    updateProgressBar();
    
    // Add typing container active state
    const container = document.querySelector('.typing-container');
    if (gameState.isActive) {
        container.classList.add('active');
    } else {
        container.classList.remove('active');
    }
    
    // Auto-scroll to current position if needed
    scrollToCurrentChar();
}

/**
 * Auto-scroll to keep current character visible
 */
function scrollToCurrentChar() {
    const currentChar = document.querySelector('.char.current');
    const quoteDisplay = document.querySelector('.quote-display');
    
    if (currentChar && quoteDisplay) {
        const charRect = currentChar.getBoundingClientRect();
        const displayRect = quoteDisplay.getBoundingClientRect();
        
        // Check if current char is outside visible area
        if (charRect.bottom > displayRect.bottom - 50) {
            quoteDisplay.scrollTop += charRect.bottom - displayRect.bottom + 50;
        }
    }
}

/**
 * Start the countdown timer
 */
function startTimer() {
    gameState.timer = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        if (gameState.timeRemaining <= 0) {
            endTest();
        }
    }, 1000);
}

/**
 * Update the timer display and circular progress
 */
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-text').textContent = timeString;
    
    // Update circle progress
    const progress = ((gameState.timeLimit - gameState.timeRemaining) / gameState.timeLimit) * 360;
    const circle = document.getElementById('timer-circle');
    circle.style.background = `conic-gradient(var(--primary-color) ${progress}deg, var(--border-color) ${progress}deg)`;
}

/**
 * Update live statistics during typing
 */
function updateStats() {
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    const wpm = Math.round((gameState.totalChars / 5) / timeElapsed) || 0;
    const accuracy = gameState.totalChars > 0 ? Math.round(((gameState.totalChars - gameState.errors) / gameState.totalChars) * 100) : 100;

    document.getElementById('wpm-stat').textContent = wpm;
    document.getElementById('accuracy-stat').textContent = accuracy + '%';
    document.getElementById('errors-stat').textContent = gameState.errors;
    document.getElementById('chars-stat').textContent = gameState.totalChars;
}

/**
 * End the current typing test
 */
function endTest() {
    gameState.isActive = false;
    gameState.endTime = Date.now();
    
    // Stop timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    // Disable input
    document.getElementById('typing-input').disabled = true;
    
    // Update UI
    document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Test';
    
    // Calculate final stats
    const testDuration = (gameState.endTime - gameState.startTime) / 1000 / 60;
    const finalWPM = Math.round((gameState.totalChars / 5) / testDuration);
    const finalAccuracy = gameState.totalChars > 0 ? Math.round(((gameState.totalChars - gameState.errors) / gameState.totalChars) * 100) : 0;
    
    // Save score if user is logged in
    if (gameState.currentUser) {
        saveScore(finalWPM, finalAccuracy);
    }
    
    // Show completion message
    showCompletionMessage(finalWPM, finalAccuracy);
}

/**
 * Reset all statistics to zero
 */
function resetStats() {
    document.getElementById('wpm-stat').textContent = '0';
    document.getElementById('accuracy-stat').textContent = '0%';
    document.getElementById('errors-stat').textContent = '0';
    document.getElementById('chars-stat').textContent = '0';
}

/**
 * Show completion message with performance feedback
 */
function showCompletionMessage(wpm, accuracy) {
    let message = `Test completed! Your typing speed: ${wpm} WPM with ${accuracy}% accuracy.`;
    
    if (wpm >= 100) {
        message += " Excellent work! You're in the top tier of typists!";
    } else if (wpm >= 70) {
        message += " Great job! You're typing faster than most people!";
    } else if (wpm >= 40) {
        message += " Good progress! Keep practicing to improve further!";
    } else {
        message += " Keep practicing! Focus on accuracy first, then speed will follow!";
    }
    
    alert(message);
}

// Theme Management Functions

/**
 * Set the application theme
 */
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    
    // Update CSS variables for purple theme
    if (theme === 'purple') {
        document.documentElement.style.setProperty('--primary-color', '#8b5cf6');
        document.documentElement.style.setProperty('--secondary-color', '#a855f7');
    } else if (theme === 'dark') {
        document.documentElement.style.setProperty('--primary-color', '#667eea');
        document.documentElement.style.setProperty('--secondary-color', '#764ba2');
    } else {
        document.documentElement.style.setProperty('--primary-color', '#667eea');
        document.documentElement.style.setProperty('--secondary-color', '#764ba2');
    }
    
    // Save theme preference
    gameState.currentTheme = theme;
}

/**
 * Load saved theme preference
 */
function loadTheme() {
    const savedTheme = gameState.currentTheme || 'light';
    setTheme(savedTheme);
}

// Modal Management Functions

/**
 * Open a modal by ID
 */
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

/**
 * Close a modal by ID
 */
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Authentication Functions

/**
 * Handle login form submission
 */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        gameState.currentUser = {
            name: email.split('@')[0],
            email: email
        };
        
        updateUserDisplay();
        closeModal('loginModal');
        showSuccessMessage('Login successful!');
        
        // Clear form
        document.getElementById('loginForm').reset();
    }
}

/**
 * Handle registration form submission
 */
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (name && email && password) {
        gameState.currentUser = {
            name: name,
            email: email
        };
        
        updateUserDisplay();
        closeModal('registerModal');
        showSuccessMessage('Registration successful!');
        
        // Clear form
        document.getElementById('registerForm').reset();
    }
}

/**
 * Update user display after login/registration
 */
function updateUserDisplay() {
    if (gameState.currentUser) {
        document.getElementById('user-name').textContent = gameState.currentUser.name;
        document.querySelector('.auth-buttons').innerHTML = `
            <button class="btn btn-secondary" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

/**
 * Logout current user
 */
function logout() {
    gameState.currentUser = null;
    document.getElementById('user-name').textContent = 'Guest User';
    document.querySelector('.auth-buttons').innerHTML = `
        <button class="btn btn-secondary" onclick="openModal('loginModal')">
            <i class="fas fa-sign-in-alt"></i> Login
        </button>
        <button class="btn btn-primary" onclick="openModal('registerModal')">
            <i class="fas fa-user-plus"></i> Register
        </button>
    `;
}

/**
 * Show success message with auto-dismiss
 */
function showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '9999';
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// Leaderboard Management Functions

/**
 * Filter and sort leaderboard by type
 */
function filterLeaderboard(type) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let sortedData = [...leaderboardData];
    
    switch(type) {
        case 'wpm':
            sortedData.sort((a, b) => b.wpm - a.wpm);
            break;
        case 'accuracy':
            sortedData.sort((a, b) => b.accuracy - a.accuracy);
            break;
        case 'recent':
            sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }
    
    displayLeaderboard(sortedData);
}

/**
 * Display leaderboard entries
 */
function displayLeaderboard(data) {
    const container = document.getElementById('leaderboard-entries');
    
    container.innerHTML = data.map((entry, index) => {
        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'other';
        const avatar = entry.name.charAt(0).toUpperCase();
        
        return `
            <div class="leaderboard-entry">
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-info">
                    <div class="player-avatar">${avatar}</div>
                    <div>
                        <div style="font-weight: 600;">${entry.name}</div>
                        <div class="player-stats">
                            <span><i class="fas fa-tachometer-alt"></i> ${entry.wpm} WPM</span>
                            <span><i class="fas fa-bullseye"></i> ${entry.accuracy}%</span>
                            <span><i class="fas fa-calendar"></i> ${entry.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load and display initial leaderboard
 */
function loadLeaderboard() {
    displayLeaderboard(leaderboardData.sort((a, b) => b.wpm - a.wpm));
}

/**
 * Save user's score to leaderboard
 */
function saveScore(wpm, accuracy) {
    const newEntry = {
        name: gameState.currentUser.name,
        wpm: wpm,
        accuracy: accuracy,
        date: new Date().toLocaleDateString()
    };
    
    leaderboardData.unshift(newEntry);
    leaderboardData = leaderboardData.slice(0, 10); // Keep only top 10
    loadLeaderboard();
}

// FAQ Management Functions

/**
 * Toggle FAQ answer visibility
 */
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    answer.classList.toggle('active');
    
    if (answer.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// Utility Helper Functions

/**
 * Get random quote from specified category
 */
function getRandomQuote(category) {
    const categoryQuotes = quotes[category] || quotes.motivation;
    return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
}

/**
 * Format seconds into MM:SS format
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Animate stat card with pulse effect
 */
function animateStatCard(cardId, newValue) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.add('pulse');
        setTimeout(() => card.classList.remove('pulse'), 600);
    }
}

/**
 * Calculate typing accuracy percentage
 */
function calculateAccuracy(totalChars, errors) {
    if (totalChars === 0) return 100;
    return Math.round(((totalChars - errors) / totalChars) * 100);
}

/**
 * Calculate Words Per Minute (WPM)
 */
function calculateWPM(totalChars, timeInMinutes) {
    if (timeInMinutes === 0) return 0;
    return Math.round((totalChars / 5) / timeInMinutes);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random user avatar color
 */
function getRandomAvatarColor() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Performance and Analytics Functions

/**
 * Track typing performance metrics
 */
function trackPerformance() {
    const performance = {
        wpm: calculateWPM(gameState.totalChars, (Date.now() - gameState.startTime) / 60000),
        accuracy: calculateAccuracy(gameState.totalChars, gameState.errors),
        timeElapsed: (Date.now() - gameState.startTime) / 1000,
        errorRate: gameState.errors / gameState.totalChars || 0
    };
    
    return performance;
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
    const perf = trackPerformance();
    return {
        summary: `WPM: ${perf.wpm}, Accuracy: ${perf.accuracy}%`,
        details: {
            wordsPerMinute: perf.wpm,
            accuracyPercentage: perf.accuracy,
            totalErrors: gameState.errors,
            charactersTyped: gameState.totalChars,
            timeElapsed: formatTime(Math.floor(perf.timeElapsed)),
            errorRate: (perf.errorRate * 100).toFixed(2) + '%'
        }
    };
}

// Error Handling and Validation

/**
 * Handle application errors gracefully
 */
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error-color);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 300px;
    `;
    errorMsg.textContent = 'An error occurred. Please refresh the page and try again.';
    
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        if (document.body.contains(errorMsg)) {
            document.body.removeChild(errorMsg);
        }
    }, 5000);
}

/**
 * Validate game state integrity
 */
function validateGameState() {
    const required = ['isActive', 'timeLimit', 'timeRemaining'];
    const missing = required.filter(prop => gameState[prop] === undefined);
    
    if (missing.length > 0) {
        throw new Error(`Missing required game state properties: ${missing.join(', ')}`);
    }
    
    return true;
}

// Wrap critical functions with error handling
const safeStartTest = () => {
    try {
        validateGameState();
        startTest();
    } catch (error) {
        handleError(error, 'startTest');
    }
};

const safeEndTest = () => {
    try {
        endTest();
    } catch (error) {
        handleError(error, 'endTest');
    }
};

// Export functions for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        quotes,
        calculateWPM,
        calculateAccuracy,
        formatTime,
        isValidEmail
    };
}
