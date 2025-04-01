// Chatbot state
let isChatbotVisible = false;
const userName = 'Ritik Kumar Yadav';
let conversationHistory = [];
let userPreferences = {
    financialGoals: [],
    spendingCategories: {},
    monthlyBudget: null,
    riskTolerance: 'moderate'
};

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggleBtn = document.querySelector('.chatbot-toggle-btn');
    
    isChatbotVisible = !isChatbotVisible;
    chatbotContainer.classList.toggle('hidden');
    
    // Update toggle button icon
    const icon = chatbotToggleBtn.querySelector('i');
    icon.className = isChatbotVisible ? 'fas fa-times' : 'fas fa-robot';
}

// Add message to chat with typing animation
async function addMessage(message, isUser = false) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser) {
        // Add typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        messagesContainer.removeChild(typingDiv);
    }
    
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Process user message and get response
async function processUserMessage(message) {
    // Add user message to chat
    addMessage(message, true);
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    try {
        // Get financial data
        const financialData = await getFinancialData();
        
        // Generate response
        const response = generateResponse(message, financialData);
        
        // Add bot response to chat
        addMessage(response);
        
        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
        
        // Update user preferences based on conversation
        updateUserPreferences(message, response);
        
    } catch (error) {
        console.error('Error processing message:', error);
        addMessage("I apologize, but I'm having trouble processing your request. Please try again later.");
    }
}

// Get current financial data
async function getFinancialData() {
    const transactions = window.transactions || [];
    const currentBalance = document.getElementById('balance').textContent;
    const currency = document.getElementById('currency').value;
    
    // Calculate financial metrics
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Categorize expenses
    const expenseCategories = {};
    expenses.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        expenseCategories[category] = (expenseCategories[category] || 0) + expense.amount;
    });
    
    return {
        currentBalance,
        currency,
        totalExpenses,
        totalIncome,
        savingsRate,
        expenseCategories,
        transactionCount: transactions.length,
        lastTransaction: transactions[transactions.length - 1]
    };
}

// Generate response based on user message and financial data
function generateResponse(message, financialData) {
    const lowerMessage = message.toLowerCase();
    
    // Basic response patterns with personalized insights
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return `Hello ${userName}! I'm your financial assistant. I can help you track expenses, analyze spending patterns, and provide personalized financial advice. What would you like to know?`;
    }
    else if (lowerMessage.includes('balance')) {
        return `Your current balance is ${financialData.currentBalance} ${financialData.currency}. ${financialData.totalIncome > 0 ? `You've earned ${formatCurrency(financialData.totalIncome)} ${financialData.currency} in total income.` : ''} Would you like to see a breakdown of your income and expenses?`;
    }
    else if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
        if (financialData.totalExpenses === 0) {
            return "I don't see any expenses recorded yet. Would you like help tracking your expenses? I can help you categorize them and identify spending patterns.";
        }
        const avgExpense = financialData.totalExpenses / financialData.transactionCount;
        return `Here's your spending analysis:\n- Total expenses: ${formatCurrency(financialData.totalExpenses)} ${financialData.currency}\n- Average expense: ${formatCurrency(avgExpense)} ${financialData.currency}\n- Number of transactions: ${financialData.transactionCount}\n\nWould you like to:\n1. See spending by category\n2. Get tips to reduce expenses\n3. Set up a budget`;
    }
    else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
        const savingsStatus = financialData.savingsRate > 20 ? "Great job! You're saving more than 20% of your income." :
                            financialData.savingsRate > 0 ? "You're saving some money, but there's room for improvement." :
                            "You might want to focus on increasing your savings.";
        
        return `${savingsStatus}\n\nHere are personalized tips to help you save more:\n1. Create a monthly budget\n2. Track your expenses\n3. Set financial goals\n4. Reduce unnecessary subscriptions\n5. Look for better deals on regular expenses\n\nYour current savings rate: ${financialData.savingsRate.toFixed(1)}%`;
    }
    else if (lowerMessage.includes('budget')) {
        return `I can help you create a personalized budget! Here's what we can do:\n1. Set up a monthly budget based on your income\n2. Review your current spending patterns\n3. Get personalized budget recommendations\n4. Set up budget alerts\n\nWould you like to start with any of these options?`;
    }
    else if (lowerMessage.includes('goal') || lowerMessage.includes('goals')) {
        return `Setting financial goals is important! Here's what we can do:\n1. Set a new financial goal\n2. Review your current goals\n3. Get personalized tips on achieving your goals\n4. Track your progress\n\nWhat would you like to focus on?`;
    }
    else if (lowerMessage.includes('help')) {
        return `I can help you with:\n1. Tracking expenses and income\n2. Creating and managing budgets\n3. Setting and tracking financial goals\n4. Saving strategies and tips\n5. Financial analysis and insights\n6. Investment recommendations\n\nWhat would you like to know more about?`;
    }
    else if (lowerMessage.includes('thank')) {
        return `You're welcome, ${userName}! Let me know if you need any other help with your finances.`;
    }
    else {
        return `I'm not sure I understand. Could you please rephrase your question? You can ask me about:\n- Your current balance and transactions\n- Expense tracking and analysis\n- Budget planning and management\n- Saving strategies and goals\n- Financial insights and recommendations`;
    }
}

// Update user preferences based on conversation
function updateUserPreferences(message, response) {
    // Extract potential preferences from the conversation
    if (message.toLowerCase().includes('goal')) {
        const goalMatch = message.match(/(?:goal|target) of (\d+)/i);
        if (goalMatch) {
            userPreferences.financialGoals.push({
                amount: parseInt(goalMatch[1]),
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Update spending categories
    if (message.toLowerCase().includes('category')) {
        const categoryMatch = message.match(/(?:category|type) of ([\w\s]+)/i);
        if (categoryMatch) {
            const category = categoryMatch[1].toLowerCase();
            userPreferences.spendingCategories[category] = true;
        }
    }
    
    // Update risk tolerance
    if (message.toLowerCase().includes('risk')) {
        if (message.toLowerCase().includes('conservative')) {
            userPreferences.riskTolerance = 'conservative';
        } else if (message.toLowerCase().includes('aggressive')) {
            userPreferences.riskTolerance = 'aggressive';
        }
    }
}

// Format currency with proper symbol and formatting
function formatCurrency(amount) {
    const currency = document.getElementById('currency').value;
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
}

// Send message when user clicks send button or presses enter
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (message) {
        processUserMessage(message);
        input.value = '';
    }
}

// Handle enter key press
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Hide chatbot initially
    document.querySelector('.chatbot-container').classList.add('hidden');
    
    // Add typing indicator styles
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 12px;
            background: #f0f2f5;
            border-radius: 15px;
            width: fit-content;
            margin: 8px 0;
        }
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #90949c;
            border-radius: 50%;
            animation: typing 1s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
    `;
    document.head.appendChild(style);
}); 