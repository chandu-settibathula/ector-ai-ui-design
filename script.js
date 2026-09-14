// State Management
let isGenerating = false;
let currentTypingInterval = null;
let attachedFiles = [];

// Core DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const menuBtn = document.getElementById('menu-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const sendIcon = document.getElementById('send-icon');
const inputContainer = document.getElementById('input-container');
const welcomeScreen = document.getElementById('welcome-screen');
const messagesContainer = document.getElementById('messages-container');
const fileInput = document.getElementById('file-input');
const attachmentsPreview = document.getElementById('attachments-preview');
const micBtn = document.getElementById('mic-btn');

// Dropdowns DOM
const modelSelectorBtn = document.getElementById('model-selector-btn');
const modelDropdown = document.getElementById('model-dropdown');
const currentModelName = document.getElementById('current-model-name');
const attachBtn = document.getElementById('attach-btn');
const attachDropdown = document.getElementById('attach-dropdown');

// Modals DOM
const navSettings = document.getElementById('nav-settings');
const navHelp = document.getElementById('nav-help');
const settingsModal = document.getElementById('settings-modal');
const helpModal = document.getElementById('help-modal');
const clearChatsBtn = document.getElementById('clear-chats-btn');

// 1. Dropdown Toggle Controllers
modelSelectorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    attachDropdown.classList.remove('active'); // Close other dropdowns
    modelDropdown.classList.toggle('active');
});

attachBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdown.classList.remove('active'); // Close other dropdowns
    attachDropdown.classList.toggle('active');
});

// Close all open dropdowns on outside click
document.addEventListener('click', () => {
    modelDropdown.classList.remove('active');
    attachDropdown.classList.remove('active');
});

// Model Dropdown Item Selection
document.querySelectorAll('#model-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const modelName = item.getAttribute('data-model');
        currentModelName.textContent = modelName;
        
        document.querySelectorAll('#model-dropdown .dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        modelDropdown.classList.remove('active');
    });
});

// Attachment Options Handler
document.getElementById('opt-upload-computer').addEventListener('click', () => {
    fileInput.removeAttribute('accept');
    fileInput.click();
});

document.getElementById('opt-upload-image').addEventListener('click', () => {
    fileInput.setAttribute('accept', 'image/*');
    fileInput.click();
});

document.getElementById('opt-drive').addEventListener('click', () => {
    // Simulated Google Drive Attachment
    attachedFiles.push({ name: 'Project_Requirements.gdoc', drive: true });
    renderAttachmentChips();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => attachedFiles.push(file));
    renderAttachmentChips();
    fileInput.value = '';
});

function renderAttachmentChips() {
    attachmentsPreview.innerHTML = '';
    attachedFiles.forEach((file, idx) => {
        const chip = document.createElement('div');
        chip.className = 'attachment-chip';
        const icon = file.drive ? 'logo-google-drive' : 'document-text-outline';
        chip.innerHTML = `
            <ion-icon name="${icon}"></ion-icon>
            <span>${escapeHTML(file.name)}</span>
            <button class="remove-attach-btn" onclick="removeAttachment(${idx})">
                <ion-icon name="close-circle-outline"></ion-icon>
            </button>
        `;
        attachmentsPreview.appendChild(chip);
    });
}

function removeAttachment(index) {
    attachedFiles.splice(index, 1);
    renderAttachmentChips();
}

// 2. Sidebar Navigation & Mobile Drawer
if (menuBtn) menuBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
sidebarOverlay.addEventListener('click', closeMobileSidebar);

function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
}

function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}

// 3. Modals Manager
navSettings.addEventListener('click', () => openModal(settingsModal));
navHelp.addEventListener('click', () => openModal(helpModal));

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal');
        closeModal(document.getElementById(modalId));
    });
});

document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
});

function openModal(modal) {
    closeMobileSidebar();
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// 4. Dynamic Theme & Accent Engine
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const theme = targetBtn.getAttribute('data-theme-val');
        
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        localStorage.setItem('gemini_theme', theme);
    });
});

document.querySelectorAll('.accent-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const targetDot = e.currentTarget;
        const accent = targetDot.getAttribute('data-accent-val');
        
        document.documentElement.setAttribute('data-accent', accent);
        document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
        targetDot.classList.add('active');
        localStorage.setItem('gemini_accent', accent);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('gemini_theme') || 'dark';
    const savedAccent = localStorage.getItem('gemini_accent') || 'default';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-accent', savedAccent);

    const activeThemeBtn = document.querySelector(`.theme-btn[data-theme-val="${savedTheme}"]`);
    if (activeThemeBtn) {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        activeThemeBtn.classList.add('active');
    }

    const activeAccentDot = document.querySelector(`.accent-dot[data-accent-val="${savedAccent}"]`);
    if (activeAccentDot) {
        document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
        activeAccentDot.classList.add('active');
    }
});

clearChatsBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    welcomeScreen.style.display = 'block';
    closeModal(settingsModal);
});

// 5. Input Field Handling
promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 150) + 'px';
});

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating) handleSendMessage();
    }
});

sendBtn.addEventListener('click', () => {
    if (isGenerating) stopGeneration();
    else handleSendMessage();
});

function useSuggestion(text) {
    if (isGenerating) return;
    promptInput.value = text;
    handleSendMessage();
}

// 6. Messaging Core
function handleSendMessage() {
    const userText = promptInput.value.trim();
    if ((!userText && attachedFiles.length === 0) || isGenerating) return;

    closeMobileSidebar();
    setGeneratingState(true);
    welcomeScreen.style.display = 'none';

    let fullUserMsg = userText;
    if (attachedFiles.length > 0) {
        const fileNames = attachedFiles.map(f => f.name).join(', ');
        fullUserMsg = `[Attached: ${fileNames}]\n${userText}`;
    }

    appendMessage(fullUserMsg, 'user');

    promptInput.value = '';
    promptInput.style.height = 'auto';
    attachedFiles = [];
    renderAttachmentChips();

    setTimeout(() => {
        const selectedModel = currentModelName.textContent;
        const responseText = generateMockResponse(userText, selectedModel);
        appendAIResponseWithTyping(responseText);
    }, 400);
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    if (sender === 'user') {
        msgDiv.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
    }
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function appendAIResponseWithTyping(fullText) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'ai');
    msgDiv.innerHTML = `
        <div class="avatar-icon"><ion-icon name="sparkles"></ion-icon></div>
        <div class="message-content"></div>
    `;
    messagesContainer.appendChild(msgDiv);
    const contentDiv = msgDiv.querySelector('.message-content');

    let index = 0;
    currentTypingInterval = setInterval(() => {
        if (index < fullText.length) {
            contentDiv.textContent += fullText.charAt(index);
            index++;
            scrollToBottom();
        } else {
            stopGeneration();
        }
    }, 15);
}

function stopGeneration() {
    if (currentTypingInterval) {
        clearInterval(currentTypingInterval);
        currentTypingInterval = null;
    }
    setGeneratingState(false);
}

function setGeneratingState(generating) {
    isGenerating = generating;
    promptInput.disabled = generating;
    attachBtn.disabled = generating;
    micBtn.disabled = generating;

    if (generating) {
        inputContainer.classList.add('disabled');
        sendBtn.classList.add('generating');
        sendBtn.title = "Stop Generating";
        sendIcon.setAttribute('name', 'square');
    } else {
        inputContainer.classList.remove('disabled');
        sendBtn.classList.remove('generating');
        sendBtn.title = "Send Prompt";
        sendIcon.setAttribute('name', 'arrow-up-outline');
    }
}

function generateMockResponse(prompt, model) {
    return `[Engine: ${model}]\n\nThis is a simulated AI response.\n\nThis UI was designed by Chandu Settibathula. Each element has been thoughtfully crafted to ensure ease of use.\n\nFeel free to interact with the various features, including the dynamic theme and accent engine, attachment options, and responsive design. The interface is built to be intuitive, allowing users to navigate seamlessly through different functionalities. Enjoy the experience!\n\nif you want to learn more about the design and development process, please visit github.com/chandu-settibathula. Your feedback is valuable and will contribute to future improvements and enhancements of the user interface. Thank you for exploring this innovative design!`;
    
}

newChatBtn.addEventListener('click', () => {
    if (isGenerating) stopGeneration();
    messagesContainer.innerHTML = '';
    welcomeScreen.style.display = 'block';
    closeMobileSidebar();
});

function scrollToBottom() {
    const chatArea = document.getElementById('chat-area');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}