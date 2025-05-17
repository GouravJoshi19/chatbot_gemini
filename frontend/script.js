document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI backend URL
    const USER_ID = 1; // Hardcoded user ID for this demo

    // --- DOM Elements ---
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryUl = document.getElementById('chat-history');
    const chatMessagesDiv = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatTitleH2 = document.getElementById('chat-title');
    const errorMessageDiv = document.getElementById('error-message');

    // --- State Variables ---
    let currentConversationId = null;
    let isLoading = false; // Prevent multiple simultaneous requests

    // --- Functions ---

    function displayError(message) {
        errorMessageDiv.textContent = message;
        console.error("API Error:", message);
    }

    function clearError() {
        errorMessageDiv.textContent = '';
    }

    function adjustTextareaHeight() {
        messageInput.style.height = 'auto'; // Reset height
        const maxHeight = 150; // Match CSS max-height
        const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
        messageInput.style.height = `${newHeight}px`;

        // Also adjust send button alignment slightly if needed (usually handled by flex-end)
         // const inputArea = document.querySelector('.input-area');
         // inputArea.style.alignItems = newHeight >= maxHeight ? 'flex-start' : 'flex-end';
    }

    // Highlight code blocks using highlight.js
    function highlightCodeBlocks() {
        // Find all <pre><code> blocks within the chat messages that haven't been highlighted yet
        chatMessagesDiv.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
             // Check if the language is specified, e.g., ```python ... ```
             // Simple check based on class name (might need refinement)
             let language = null;
             const preElement = block.parentElement;
             if (preElement.className.startsWith('language-')) {
                language = preElement.className.replace('language-', '');
             }

             try {
                 if (language && hljs.getLanguage(language)) {
                     hljs.highlightElement(block);
                 } else {
                     // Auto-detect if language not specified or not loaded/supported
                     hljs.highlightElement(block);
                 }
                 // Add 'hljs' class manually if highlight.js didn't add it (sometimes happens)
                 block.classList.add('hljs');

                 // Optional: Add a copy button (more advanced)
                // addCopyButton(preElement);

             } catch (error) {
                 console.error("Highlight.js error:", error, "on block:", block.textContent.substring(0, 50));
                 // Fallback: Ensure it still looks like code even if highlighting fails
                 block.classList.add('hljs'); // Add class to prevent re-trying
             }
         });
    }

    // Helper function for basic Markdown to HTML conversion
    function renderMarkdownSimple(markdownText) {
        if (!markdownText) return ''; // Handle null/undefined input

        // Escape basic HTML characters first to prevent XSS if the source is less trusted
        // (Though less critical if only handling ** and ` from your LLM title generation)
        let escapedText = markdownText
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "'")
            .replace(/'/g, "'");

        // Convert **bold** to <strong>bold</strong>
        let htmlContent = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert `inline code` to <code>inline code</code>
        // Note: The previous escaping handles potential HTML within the code backticks
        htmlContent = htmlContent.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Add other simple conversions if your titles use them (e.g., *italic*)
        // htmlContent = htmlContent.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

        // No need to handle \n here as titles are usually single line,
        // and CSS white-space handles wrapping anyway.

        return htmlContent;
    }
    // Display a message in the chat window
    function displayMessage(sender, text) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');
        if (sender === 'user') {
            messageWrapper.classList.add('user-wrapper');
        }
    
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
    
        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
    
        if (sender === 'ai') {
            // Apply CSS for automatic newline handling (ensure this rule exists in style.css)
            // This handles '\n' characters correctly.
            messageContentDiv.style.whiteSpace = 'pre-wrap';
    
            // Convert basic Markdown to HTML before inserting
            let htmlContent = text
                // **bold** -> <strong>bold</strong>
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 // Optional: *italic* -> <em>italic</em>
                 .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>') // More specific italic regex
                 // `inline code` -> <code>inline code</code> (Escape HTML inside)
                 .replace(/`([^`]+)`/g, (match, code) => {
                     const escapedCode = code.replace(/</g, "<").replace(/>/g, ">");
                     return `<code>${escapedCode}</code>`;
                 });
                // Note: Code blocks (```...```) should ideally be handled by highlight.js if used.
                // If not using highlight.js, you'd add a replacement here, but it's complex.
                // Assuming ``` blocks are handled by highlightCodeBlocksInElement if needed.
    
    
            // IMPORTANT: Use innerHTML to render the generated HTML tags
            messageContentDiv.innerHTML = htmlContent;
    
            // If you still use highlight.js for code blocks (```...```), call it AFTER setting innerHTML
            // Ensure the Markdown-to-HTML conversion above *doesn't* interfere badly
            // with the <pre><code> structure expected by highlight.js.
            // It might be better to handle ``` blocks entirely separately if using hljs.
            highlightCodeBlocksInElement(messageContentDiv); // Highlight code blocks if any exist
    
    
        } else { // User message
            // Use textContent for safety, user input shouldn't be rendered as HTML
            messageContentDiv.textContent = text;
        }
    
        messageDiv.appendChild(messageContentDiv);
        messageWrapper.appendChild(messageDiv);
        chatMessagesDiv.appendChild(messageWrapper);
    
        // Scroll to the bottom
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    
        return messageContentDiv; // Return the element if needed
    }
    
    // Ensure highlightCodeBlocksInElement function exists (even if empty)
    function highlightCodeBlocksInElement(element) {
        // Check if highlight.js library is loaded
        if (typeof hljs !== 'undefined' && element) {
            element.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
                 try {
                     // console.log("Highlighting block:", block.textContent.substring(0, 30));
                     hljs.highlightElement(block);
                     block.classList.add('hljs'); // Ensure class is added
                 } catch (error) {
                     console.error("Highlight.js error:", error);
                     // Add class anyway to prevent re-trying on error
                     block.classList.add('hljs');
                 }
             });
        } else if (!element) {
             console.warn("highlightCodeBlocksInElement called with null element");
        }
    }

    function displayLoadingMessage() {
        const loadingWrapper = document.createElement('div');
        loadingWrapper.classList.add('message-wrapper');
        loadingWrapper.id = 'loading-indicator-wrapper'; // ID on the wrapper

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'loading');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = 'AI is thinking...'; // Use textContent here

        messageDiv.appendChild(contentDiv);
        loadingWrapper.appendChild(messageDiv);
        chatMessagesDiv.appendChild(loadingWrapper);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    function removeLoadingMessage() {
        const loadingIndicator = document.getElementById('loading-indicator-wrapper');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

        // Inside fetchChatHistory function
        async function fetchChatHistory() {
            clearError();
            setLoadingState(true, 'history');
            chatHistoryUl.innerHTML = '<li class="loading">Loading history...</li>';
    
            try {
                const response = await fetch(`${API_BASE_URL}/chat/${USER_ID}/conversations`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch history' }));
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
    
                chatHistoryUl.innerHTML = ''; // Clear loading/previous history
    
                if (data.history && data.history.length > 0) {
                    data.history.forEach(conv => {
                        const li = document.createElement('li');
    
                        const rawTitle = conv.title || 'Untitled Chat'; // Get the raw title
                        const htmlTitle = renderMarkdownSimple(rawTitle); // Convert to HTML
    
                        li.innerHTML = htmlTitle; // <-- USE innerHTML to render the HTML
                        li.dataset.conversationId = conv.conversation_id;
                        li.dataset.rawTitle = rawTitle; // <-- STORE the original raw title separately
    
                        li.setAttribute('role', 'button');
                        li.setAttribute('tabindex', '0');
                        li.addEventListener('click', () => loadConversation(conv.conversation_id, li));
                        li.addEventListener('keydown', (e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  loadConversation(conv.conversation_id, li);
                             }
                         });
                        chatHistoryUl.appendChild(li);
                    });
                } else {
                    chatHistoryUl.innerHTML = '<li class="loading">No history yet.</li>';
                }
            } catch (error) {
                displayError(`Error fetching history: ${error.message}`);
                chatHistoryUl.innerHTML = '<li class="loading">Error loading history.</li>';
            } finally {
                setLoadingState(false, 'history');
                updateActiveHistoryItem();
            }
        }

    async function loadConversation(conversationId, clickedLi = null) {
        if (isLoading) return;
        clearError();
        setLoadingState(true, 'chat');

        currentConversationId = conversationId;
        chatMessagesDiv.innerHTML = '<p class="info-message">Loading messages...</p>';
        
        const historyItem = chatHistoryUl.querySelector(`li[data-conversation-id="${conversationId}"]`);
        const rawTitle = historyItem ? historyItem.dataset.rawTitle : "Loading...";
        const htmlTitle = renderMarkdownSimple(rawTitle); // Convert to HTML
        chatTitleH2.innerHTML = htmlTitle;

        try {
            const response = await fetch(`${API_BASE_URL}/chat/${USER_ID}/conversation/${conversationId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Conversation not found or error fetching it.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const finalHistoryItem = chatHistoryUl.querySelector(`li[data-conversation-id="${conversationId}"]`);
            const finalRawTitle = finalHistoryItem ? finalHistoryItem.dataset.rawTitle : "Chat";
            chatTitleH2.innerHTML = renderMarkdownSimple(finalRawTitle);

            if (data.conversation && data.conversation.length > 0) {
                data.conversation.forEach(msg => {
                    if (msg.query) displayMessage('user', msg.query);
                    if (msg.response) displayMessage('ai', msg.response); // Will trigger highlight
                });
                 // Ensure all code blocks are highlighted after initial load
                 highlightCodeBlocks();
            } else {
                chatMessagesDiv.innerHTML = '<p class="info-message">No messages in this conversation yet.</p>';
            }

        } catch (error) {
            displayError(`Error loading conversation: ${error.message}`);
            chatMessagesDiv.innerHTML = `<p class="info-message error-message">Could not load chat: ${error.message}</p>`;
            chatTitleH2.innerHTML = renderMarkdownSimple("Error Loading Chat");
            currentConversationId = null;
        } finally {
            setLoadingState(false, 'chat');
            updateActiveHistoryItem();
            messageInput.focus();
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll to bottom after loading
        }
    }

    function updateActiveHistoryItem() {
        const historyItems = chatHistoryUl.querySelectorAll('li');
        historyItems.forEach(item => {
            if (item.dataset.conversationId === currentConversationId) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'true'); // Accessibility
            } else {
                item.classList.remove('active');
                 item.removeAttribute('aria-current');
            }
        });
    }

    async function startNewChat() {
        if (isLoading) return;
        clearError();
        setLoadingState(true, 'new_chat');

        currentConversationId = null;
        chatMessagesDiv.innerHTML = '<p class="info-message">Starting new chat...</p>';
        chatTitleH2.textContent = "New Chat";
        updateActiveHistoryItem();
        messageInput.value = '';
        adjustTextareaHeight();

        try {
            const response = await fetch(`${API_BASE_URL}/chat/${USER_ID}`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to create new chat session.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            currentConversationId = data.conversation_id;

            chatMessagesDiv.innerHTML = '<p class="info-message">New chat started. Send a message!</p>';
            chatTitleH2.textContent = "New Chat";
            messageInput.focus();

        } catch (error) {
            displayError(`Error starting new chat: ${error.message}`);
            chatMessagesDiv.innerHTML = `<p class="info-message error-message">Could not start new chat: ${error.message}</p>`;
            chatTitleH2.textContent = "Error";
        } finally {
            setLoadingState(false, 'new_chat');
             messageInput.focus(); // Ensure focus is set
        }
    }

    async function sendMessage() {
        const query = messageInput.value.trim();
        if (!query || isLoading) return;

        if (!currentConversationId) {
            console.warn("No current conversation ID. Starting new chat implicitly.");
            // Don't await here, let it start in the background if needed,
            // but show error immediately if startNewChat hasn't provided an ID yet.
            startNewChat();
             // Give a tiny moment for the async call to potentially set the ID
             await new Promise(resolve => setTimeout(resolve, 50));
             if (!currentConversationId) {
                displayError("Please wait for the new chat to initialize or click 'New Chat'.");
                return;
             }
            // Proceed if ID is now available
        }

        clearError();
        setLoadingState(true, 'send');
        displayMessage('user', query);
        messageInput.value = '';
        adjustTextareaHeight();
        displayLoadingMessage();

        try {
            const response = await fetch(`${API_BASE_URL}/chat/${USER_ID}/conversation/${currentConversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            removeLoadingMessage();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to get response from server.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            displayMessage('ai', data.response); // Will trigger highlight

            // Check if the title is still "New Chat" and refresh history if needed
            const isFirstMessageOrUntitled = (chatTitleH2.textContent === "New Chat" || chatMessagesDiv.querySelectorAll('.message.ai').length === 1);
            if (isFirstMessageOrUntitled) {
                 // Fetch history again to get the actual title assigned by the backend
                 await fetchChatHistory(); // Refresh history list
                 // Re-find the potentially updated title in the history list
                 const historyItem = chatHistoryUl.querySelector(`li[data-conversation-id="${currentConversationId}"]`);
                 if(historyItem) {
                      chatTitleH2.textContent = historyItem.textContent; // Update main title
                      updateActiveHistoryItem(); // Ensure it's marked active
                 }
            }

        } catch (error) {
            removeLoadingMessage();
            // Display error message as an AI response for visibility
             displayMessage('ai', `Sorry, I encountered an error processing your request.\nError: ${error.message}`);
             displayError(`Error sending message: ${error.message}`); // Show error below input too
        } finally {
            setLoadingState(false, 'send');
            messageInput.focus();
             // Ensure scroll to bottom after response or error
             chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }
    }

    function setLoadingState(loading, context = 'general') {
        isLoading = loading;
        sendButton.disabled = loading;
        messageInput.disabled = loading;

        if (context === 'send' || context === 'new_chat' || context === 'chat') {
            newChatBtn.disabled = loading;
            chatHistoryUl.style.pointerEvents = loading ? 'none' : 'auto';
            chatHistoryUl.style.opacity = loading ? 0.7 : 1;
        }
    }

    // --- Event Listeners ---
    newChatBtn.addEventListener('click', startNewChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    messageInput.addEventListener('input', adjustTextareaHeight);

    // --- Initial Load ---
    fetchChatHistory();
    adjustTextareaHeight(); // Initial height adjustment for placeholder
    // Initialize highlighting (might not be needed if no initial content)
    // hljs.highlightAll(); // Or call highlightCodeBlocks() if loading initial state

     // Optional: Focus input on load if no chat is selected
     // if (!currentConversationId) {
     //      messageInput.focus();
     // }
});