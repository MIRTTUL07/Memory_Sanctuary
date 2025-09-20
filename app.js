// Enhanced Memory Sanctuary JavaScript with Journal System
document.addEventListener('DOMContentLoaded', function() {
    
    // Quotes data from the provided JSON
    const quotes = [
        {
            text: "She believed she could, so she became a doctor.",
            author: "Medical Inspiration"
        },
        {
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt"
        },
        {
            text: "You have brains in your head. You have feet in your shoes. You can steer yourself in any direction you choose.",
            author: "Dr. Seuss"
        },
        {
            text: "Empowered women heal the world, one patient at a time.",
            author: "Medical Inspiration"
        },
        {
            text: "Every challenge met is another life touched, another story reshaped.",
            author: "Medical Inspiration"
        },
        {
            text: "The good physician treats the disease; the great physician treats the patient who has the disease.",
            author: "William Osler"
        },
        {
            text: "Medicine is not only a science; it is also an art.",
            author: "Paracelsus"
        },
        {
            text: "You're not just studying to be a doctor; you're evolving into a beacon of hope.",
            author: "Medical Inspiration"
        }
    ];

    // Encouraging messages and placeholder texts
    const encouragingMessages = [
        "Look how much you've grown! 💕",
        "Your thoughts are precious - keep writing! ✨",
        "Every word you write is a step forward 💪",
        "Your journey is beautiful, and so are your reflections 🌸",
        "You're creating a beautiful story of growth 📖"
    ];

    const placeholderTexts = [
        "Write your thoughts here... you're doing amazing! 💕",
        "What's on your heart today? This space is yours 💖",
        "Share your thoughts, dreams, or worries... everything is welcome here 🌟",
        "How are you feeling about your journey today? 💭"
    ];

    // Journal System
    class JournalSystem {
        constructor() {
            this.entries = [];
            this.currentEditingId = null;
            this.autoSaveTimeout = null;
            this.init();
        }

        init() {
            this.loadEntries();
            this.bindEvents();
            this.updateStats();
            this.renderEntries();
            this.setRandomPlaceholder();
            this.showRandomMotivationalMessage();
        }

        // Generate unique ID for entries
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Load entries from localStorage
        loadEntries() {
            try {
                const stored = localStorage.getItem('journalEntries');
                this.entries = stored ? JSON.parse(stored) : [];
                
                // Ensure entries have all required fields
                this.entries = this.entries.map(entry => ({
                    id: entry.id || this.generateId(),
                    title: entry.title || '',
                    content: entry.content || '',
                    date: entry.date || new Date().toISOString(),
                    lastModified: entry.lastModified || entry.date || new Date().toISOString(),
                    wordCount: entry.wordCount || this.countWords(entry.content || '')
                }));
            } catch (error) {
                console.log('Error loading journal entries:', error);
                this.entries = [];
            }
        }

        // Save entries to localStorage
        saveEntries() {
            try {
                localStorage.setItem('journalEntries', JSON.stringify(this.entries));
                this.showAutoSaveIndicator();
            } catch (error) {
                console.log('Error saving journal entries:', error);
            }
        }

        // Count words in text
        countWords(text) {
            return text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
        }

        // Format date for display
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            } else if (diffDays === 1) {
                return `Yesterday at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        }

        // Create new journal entry
        createEntry(title, content) {
            if (!content.trim()) return false;

            const entry = {
                id: this.generateId(),
                title: title.trim(),
                content: content.trim(),
                date: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                wordCount: this.countWords(content)
            };

            this.entries.unshift(entry);
            this.saveEntries();
            this.updateStats();
            this.renderEntries();
            this.clearForm();
            return true;
        }

        // Update existing entry
        updateEntry(id, title, content) {
            const entryIndex = this.entries.findIndex(entry => entry.id === id);
            if (entryIndex === -1) return false;

            this.entries[entryIndex] = {
                ...this.entries[entryIndex],
                title: title.trim(),
                content: content.trim(),
                lastModified: new Date().toISOString(),
                wordCount: this.countWords(content)
            };

            this.saveEntries();
            this.updateStats();
            this.renderEntries();
            return true;
        }

        // Delete entry
        deleteEntry(id) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.updateStats();
            this.renderEntries();
        }

        // Get entry by ID
        getEntry(id) {
            return this.entries.find(entry => entry.id === id);
        }

        // Search entries
        searchEntries(query) {
            if (!query.trim()) return this.entries;
            
            const searchTerm = query.toLowerCase();
            return this.entries.filter(entry => 
                entry.title.toLowerCase().includes(searchTerm) ||
                entry.content.toLowerCase().includes(searchTerm)
            );
        }

        // Sort entries
        sortEntries(entries, sortBy) {
            const sorted = [...entries];
            
            switch (sortBy) {
                case 'oldest':
                    return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                case 'title':
                    return sorted.sort((a, b) => {
                        const titleA = a.title || 'Untitled';
                        const titleB = b.title || 'Untitled';
                        return titleA.localeCompare(titleB);
                    });
                case 'newest':
                default:
                    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        }

        // Update statistics
        updateStats() {
            const totalEntries = this.entries.length;
            const totalWords = this.entries.reduce((sum, entry) => sum + entry.wordCount, 0);
            const dates = this.entries.map(entry => new Date(entry.date).toDateString());
            const uniqueDates = [...new Set(dates)];
            const daysJournaling = uniqueDates.length;

            document.getElementById('totalEntries').textContent = totalEntries;
            document.getElementById('totalWords').textContent = totalWords.toLocaleString();
            document.getElementById('daysjournaling').textContent = daysJournaling;
        }

        // Render entries list
        renderEntries() {
            const entriesList = document.getElementById('entriesList');
            const searchQuery = document.getElementById('searchEntries').value;
            const sortBy = document.getElementById('sortEntries').value;
            
            let filteredEntries = this.searchEntries(searchQuery);
            filteredEntries = this.sortEntries(filteredEntries, sortBy);

            if (filteredEntries.length === 0) {
                if (searchQuery) {
                    entriesList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <h4>No entries found</h4>
                            <p>Try adjusting your search terms or write your first entry!</p>
                        </div>
                    `;
                } else {
                    entriesList.innerHTML = `
                        <div class="empty-state" id="emptyState">
                            <div class="empty-icon">📖</div>
                            <h4>Start Your Beautiful Journey</h4>
                            <p>Your first journal entry is waiting to be written. Share your thoughts, dreams, or just how you're feeling today. This space is yours! 💖</p>
                        </div>
                    `;
                }
                return;
            }

            entriesList.innerHTML = filteredEntries.map(entry => `
                <div class="entry-card" data-entry-id="${entry.id}">
                    <div class="entry-header">
                        <h4 class="entry-title">${entry.title || 'Untitled Entry'}</h4>
                        <span class="entry-date">${this.formatDate(entry.date)}</span>
                    </div>
                    <p class="entry-preview">${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}</p>
                    <div class="entry-footer">
                        <span>${entry.wordCount} word${entry.wordCount !== 1 ? 's' : ''}</span>
                        <span>Click to read more</span>
                    </div>
                </div>
            `).join('');

            // Add click listeners to entry cards
            document.querySelectorAll('.entry-card').forEach(card => {
                card.addEventListener('click', () => {
                    const entryId = card.dataset.entryId;
                    this.showEntryModal(entryId);
                });
            });
        }

        // Show entry in modal
        showEntryModal(entryId) {
            const entry = this.getEntry(entryId);
            if (!entry) return;

            document.getElementById('modalEntryDate').textContent = this.formatDate(entry.date);
            document.getElementById('modalWordCount').textContent = `${entry.wordCount} word${entry.wordCount !== 1 ? 's' : ''}`;
            document.getElementById('modalEntryTitle').textContent = entry.title || 'Untitled Entry';
            document.getElementById('modalEntryContent').innerHTML = entry.content.replace(/\n/g, '<br>');

            // Set up edit form
            document.getElementById('editTitle').value = entry.title;
            document.getElementById('editContent').value = entry.content;

            this.currentEditingId = entryId;
            this.showModal('entryModal');
        }

        // Clear the form
        clearForm() {
            document.getElementById('journalTitle').value = '';
            document.getElementById('journalText').value = '';
            this.updateCharacterCount();
        }

        // Show modal
        showModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        // Hide modal
        hideModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Reset edit mode
            if (modalId === 'entryModal') {
                document.querySelector('.entry-title-display').style.display = 'block';
                document.querySelector('.entry-content').style.display = 'block';
                document.getElementById('editMode').classList.add('hidden');
                document.querySelector('.modal-actions').style.display = 'flex';
                document.getElementById('editActions').classList.add('hidden');
            }
        }

        // Toggle edit mode
        toggleEditMode() {
            const titleDisplay = document.querySelector('.entry-title-display');
            const contentDisplay = document.querySelector('.entry-content');
            const editMode = document.getElementById('editMode');
            const modalActions = document.querySelector('.modal-actions');
            const editActions = document.getElementById('editActions');

            const isEditing = !editMode.classList.contains('hidden');

            if (isEditing) {
                // Cancel edit
                titleDisplay.style.display = 'block';
                contentDisplay.style.display = 'block';
                editMode.classList.add('hidden');
                modalActions.style.display = 'flex';
                editActions.classList.add('hidden');
            } else {
                // Start edit
                titleDisplay.style.display = 'none';
                contentDisplay.style.display = 'none';
                editMode.classList.remove('hidden');
                modalActions.style.display = 'none';
                editActions.classList.remove('hidden');
            }
        }

        // Save edit
        saveEdit() {
            const title = document.getElementById('editTitle').value;
            const content = document.getElementById('editContent').value;

            if (this.updateEntry(this.currentEditingId, title, content)) {
                this.hideModal('entryModal');
                // Show updated entry
                setTimeout(() => {
                    this.showEntryModal(this.currentEditingId);
                }, 100);
            }
        }

        // Export entry
        exportEntry(entryId) {
            const entry = this.getEntry(entryId);
            if (!entry) return;

            const content = `${entry.title || 'Untitled Entry'}\n${this.formatDate(entry.date)}\n\n${entry.content}`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal-entry-${new Date(entry.date).toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Show auto-save indicator
        showAutoSaveIndicator() {
            const indicator = document.getElementById('autoSaveIndicator');
            if (indicator) {
                indicator.classList.add('show');
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 2000);
            }
        }

        // Update character count
        updateCharacterCount() {
            const textarea = document.getElementById('journalText');
            const counter = document.getElementById('characterCount');
            if (textarea && counter) {
                const count = textarea.value.length;
                counter.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
            }
        }

        // Auto-save draft
        autoSave() {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                const title = document.getElementById('journalTitle').value;
                const content = document.getElementById('journalText').value;
                
                if (title.trim() || content.trim()) {
                    try {
                        const draft = { title, content, timestamp: Date.now() };
                        localStorage.setItem('journalDraft', JSON.stringify(draft));
                        this.showAutoSaveIndicator();
                    } catch (error) {
                        console.log('Error saving draft:', error);
                    }
                }
            }, 1000);
        }

        // Load draft
        loadDraft() {
            try {
                const draft = localStorage.getItem('journalDraft');
                if (draft) {
                    const { title, content } = JSON.parse(draft);
                    document.getElementById('journalTitle').value = title || '';
                    document.getElementById('journalText').value = content || '';
                    this.updateCharacterCount();
                }
            } catch (error) {
                console.log('Error loading draft:', error);
            }
        }

        // Clear draft
        clearDraft() {
            try {
                localStorage.removeItem('journalDraft');
            } catch (error) {
                console.log('Error clearing draft:', error);
            }
        }

        // Set random placeholder
        setRandomPlaceholder() {
            const textarea = document.getElementById('journalText');
            if (textarea) {
                const randomPlaceholder = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
                textarea.placeholder = randomPlaceholder;
            }
        }

        // Show random motivational message
        showRandomMotivationalMessage() {
            const messageElement = document.getElementById('motivationalMessage');
            if (messageElement && this.entries.length > 0) {
                const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
                messageElement.textContent = randomMessage;
            }
        }

        // Bind all event listeners
        bindEvents() {
            // Load draft on init
            this.loadDraft();

            // Save entry button
            document.getElementById('saveJournal').addEventListener('click', () => {
                const title = document.getElementById('journalTitle').value;
                const content = document.getElementById('journalText').value;
                
                if (this.createEntry(title, content)) {
                    this.clearDraft();
                    this.showRandomMotivationalMessage();
                } else {
                    alert('Please write something before saving! 💕');
                }
            });

            // Clear button
            document.getElementById('clearJournal').addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your current entry?')) {
                    this.clearForm();
                    this.clearDraft();
                }
            });

            // Auto-save as user types
            document.getElementById('journalText').addEventListener('input', () => {
                this.updateCharacterCount();
                this.autoSave();
            });

            document.getElementById('journalTitle').addEventListener('input', () => {
                this.autoSave();
            });

            // Search functionality
            document.getElementById('searchEntries').addEventListener('input', () => {
                this.renderEntries();
            });

            // Sort functionality
            document.getElementById('sortEntries').addEventListener('change', () => {
                this.renderEntries();
            });

            // Modal events
            document.getElementById('modalClose').addEventListener('click', () => {
                this.hideModal('entryModal');
            });

            document.getElementById('modalOverlay').addEventListener('click', () => {
                this.hideModal('entryModal');
            });

            // Entry modal actions
            document.getElementById('editEntry').addEventListener('click', () => {
                this.toggleEditMode();
            });

            document.getElementById('cancelEdit').addEventListener('click', () => {
                this.toggleEditMode();
            });

            document.getElementById('saveEdit').addEventListener('click', () => {
                this.saveEdit();
            });

            document.getElementById('exportEntry').addEventListener('click', () => {
                this.exportEntry(this.currentEditingId);
            });

            document.getElementById('deleteEntry').addEventListener('click', () => {
                this.showModal('deleteModal');
            });

            // Delete confirmation modal
            document.getElementById('cancelDelete').addEventListener('click', () => {
                this.hideModal('deleteModal');
            });

            document.getElementById('confirmDelete').addEventListener('click', () => {
                this.deleteEntry(this.currentEditingId);
                this.hideModal('deleteModal');
                this.hideModal('entryModal');
            });

            // Close modals with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideModal('entryModal');
                    this.hideModal('deleteModal');
                }
            });
        }
    }

    // Quote Management (existing functionality)
    let currentQuoteIndex = 0;
    let quoteInterval;
    const quoteCards = document.querySelectorAll('.quote-card');
    const prevBtn = document.getElementById('prevQuote');
    const nextBtn = document.getElementById('nextQuote');
    const indicatorsContainer = document.getElementById('quoteIndicators');

    function createQuoteIndicators() {
        if (!indicatorsContainer) return;
        
        for (let i = 0; i < quotes.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = `quote-indicator ${i === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => {
                showQuote(i);
                restartQuoteRotation();
            });
            indicatorsContainer.appendChild(indicator);
        }
    }

    function showQuote(index) {
        quoteCards.forEach(card => {
            card.classList.remove('active');
        });
        
        if (quoteCards[index]) {
            quoteCards[index].classList.add('active');
        }
        
        const indicators = document.querySelectorAll('.quote-indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentQuoteIndex = index;
    }

    function nextQuote() {
        const nextIndex = (currentQuoteIndex + 1) % quotes.length;
        showQuote(nextIndex);
    }

    function prevQuote() {
        const prevIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
        showQuote(prevIndex);
    }

    function startQuoteRotation() {
        quoteInterval = setInterval(nextQuote, 8000);
    }

    function restartQuoteRotation() {
        clearInterval(quoteInterval);
        startQuoteRotation();
    }

    function initQuotes() {
        createQuoteIndicators();
        showQuote(0);
        startQuoteRotation();
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevQuote();
                restartQuoteRotation();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextQuote();
                restartQuoteRotation();
            });
        }
    }

    // Smooth Scrolling for Navigation
    function initSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Memory Card Interactions
    function initMemoryCards() {
        const memoryCards = document.querySelectorAll('.memory-card');
        
        memoryCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });

            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    // Header scroll effect
    function initHeaderEffects() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 50) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    }

    // Intersection Observer for animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Keyboard shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Alt + Left Arrow - Previous quote
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                prevQuote();
                restartQuoteRotation();
            }
            
            // Alt + Right Arrow - Next quote
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                nextQuote();
                restartQuoteRotation();
            }
            
            // Ctrl/Cmd + S - Save journal
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                document.getElementById('saveJournal').click();
            }
        });
    }

    // Add sparkle effect on memory card hover
    function addSparkleEffect() {
        const memoryCards = document.querySelectorAll('.memory-card');
        
        memoryCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                for (let i = 0; i < 3; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.innerHTML = '✨';
                    sparkle.style.position = 'absolute';
                    sparkle.style.pointerEvents = 'none';
                    sparkle.style.fontSize = '12px';
                    sparkle.style.left = Math.random() * 80 + 10 + '%';
                    sparkle.style.top = Math.random() * 80 + 10 + '%';
                    sparkle.style.opacity = '0';
                    sparkle.style.transition = 'all 0.5s ease-out';
                    sparkle.style.zIndex = '10';
                    
                    this.style.position = 'relative';
                    this.appendChild(sparkle);
                    
                    setTimeout(() => {
                        sparkle.style.opacity = '1';
                        sparkle.style.transform = 'translateY(-10px)';
                    }, i * 100);
                    
                    setTimeout(() => {
                        if (sparkle.parentNode) {
                            sparkle.parentNode.removeChild(sparkle);
                        }
                    }, 1000);
                }
            });
        });
    }

    // Check for special dates
    function checkSpecialDates() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        const specialDates = {
            "1-1": "🎉 Happy New Year! This year will bring amazing things for you!",
            "2-14": "💕 Happy Valentine's Day! You are so loved!",
            "3-8": "👩‍⚕️ Happy International Women's Day! You're changing the world!",
            "12-25": "🎄 Merry Christmas! Sending you all my love!"
        };
        
        const dateKey = `${month}-${day}`;
        if (specialDates[dateKey]) {
            setTimeout(() => {
                const messageDiv = document.createElement('div');
                messageDiv.textContent = specialDates[dateKey];
                messageDiv.style.cssText = `
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    background: var(--gradient-main); color: white; padding: 20px;
                    border-radius: 15px; box-shadow: var(--shadow-lg);
                    font-weight: 500; max-width: 300px; text-align: center;
                    animation: slideInRight 0.5s ease-out;
                `;
                document.body.appendChild(messageDiv);
                
                setTimeout(() => {
                    messageDiv.style.animation = 'slideOutRight 0.5s ease-out forwards';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            document.body.removeChild(messageDiv);
                        }
                    }, 500);
                }, 5000);
            }, 3000);
        }
    }

    // Initialize all features
    function init() {
        // Initialize existing features
        initQuotes();
        initSmoothScrolling();
        initMemoryCards();
        initHeaderEffects();
        initScrollAnimations();
        initKeyboardShortcuts();
        addSparkleEffect();
        checkSpecialDates();
        
        // Initialize enhanced journal system
        new JournalSystem();
        
        // Add welcome animation
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
        console.log('Enhanced Memory Sanctuary initialized successfully! 💕');
    }

    // Start the application
    init();

    // Console messages
    console.log("💕 Welcome to your Enhanced Memory Sanctuary! 💕");
    console.log("New journal features available:");
    console.log("- Save multiple journal entries");
    console.log("- Search and filter entries");
    console.log("- Edit and delete entries");
    console.log("- Export entries as text files");
    console.log("- Auto-save drafts");
    console.log("- Beautiful statistics tracking");
    console.log("Keyboard shortcuts:");
    console.log("- Alt + Left/Right Arrow: Navigate quotes");
    console.log("- Ctrl/Cmd + S: Save journal entry");
    console.log("- Escape: Close modals");
    console.log("Remember: You are loved, capable, and amazing! 🌟");
});

// Easter egg - double click on title
document.addEventListener('dblclick', function(e) {
    if (e.target.classList.contains('site-title')) {
        const messages = [
            "You found the secret! 🎉 You're amazing at everything you do!",
            "Double-click master! 💕 Your attention to detail will make you a great doctor!",
            "Secret discovered! 🌟 You have such a curious mind!",
            "Easter egg found! 🥚 Your best friend thinks you're incredible!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const messageDiv = document.createElement('div');
        messageDiv.textContent = randomMessage;
        messageDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 197, 211, 0.95); color: white; padding: 20px 30px;
            border-radius: 20px; font-size: 18px; font-weight: 500; z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); animation: bounceIn 0.5s ease-out;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'bounceOut 0.5s ease-out forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    document.body.removeChild(messageDiv);
                }
            }, 500);
        }, 3000);
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes bounceIn {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
        50% { transform: translate(-50%, -50%) scale(1.05); }
        70% { transform: translate(-50%, -50%) scale(0.9); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes bounceOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
    }
`;
document.head.appendChild(style);