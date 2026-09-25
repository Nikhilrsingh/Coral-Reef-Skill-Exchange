import authService from "../services/authService.js";

const API_BASE_URL =
    "http://127.0.0.1:8000/api";

const token =
    authService.getToken();

if (!token) {
    window.location.href =
        "login.html";
}

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const messagesArea =
    document.getElementById("messagesArea");

const conversationSearch =
    document.getElementById("conversationSearch");

const chatUserName =
    document.getElementById("chatUserName");

const chatAvatar =
    document.getElementById("chatAvatar");

const selectedUserId =
    new URLSearchParams(
        window.location.search
    ).get("user");

let conversations = [];

let activeConversationId = null;

let currentUserId = null;

async function loadCurrentUser() {
    const user =
        await authService.getCurrentUserFromAPI();

    currentUserId = user.id;
}

async function apiRequest(
    endpoint,
    options = {}
) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type":
                    "application/json",
                "Authorization":
                    `Token ${token}`,
                ...(options.headers || {})
            }
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.error ||
            "Something went wrong."
        );
    }

    return data;
}

async function loadConversations() {
    try {
        conversations =
            await apiRequest(
                "/chat/conversations/"
            );

        console.log(
            "Conversations:",
            conversations
        );

        renderConversations();

    } catch (error) {
        console.error(
            "Unable to load conversations:",
            error
        );
    }
}

loadCurrentUser()
    .then(() => loadConversations())
    .then(() => openSelectedConversation());

async function openSelectedConversation() {
    if (!selectedUserId) {
        return;
    }

    try {
        const conversation =
            await apiRequest(
                "/chat/conversations/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        receiver:
                            Number(selectedUserId)
                    })
                }
            );

        await openConversation(
    conversation
);  

        console.log(
            "Active conversation:",
            conversation
        );

    } catch (error) {
        console.error(
            "Unable to open conversation:",
            error
        );
    }
}

async function loadMessages(conversationId) {
    try {
        const messages =
            await apiRequest(
                `/chat/conversations/${conversationId}/messages/`
            );

        console.log(
            "Messages:",
            messages
        );

        renderMessages(messages);

    } catch (error) {
        console.error(
            "Unable to load messages:",
            error
        );
    }
}

function renderMessages(messages) {
    if (!messagesArea) {
        return;
    }

    messagesArea.innerHTML = "";

    messages.forEach(message => {
        const messageElement =
            document.createElement("div");

        messageElement.className =
            "message " +
            (
                Number(message.sender) !==
                Number(currentUserId)
                    ? "received"
                    : "sent"
            );

        messageElement.innerHTML = `
            <div class="message-bubble">
                ${escapeHtml(message.content)}
            </div>
        `;

        messagesArea.appendChild(
            messageElement
        );
    });

    messagesArea.scrollTop =
        messagesArea.scrollHeight;
}

function escapeHtml(text) {
    const element =
        document.createElement("div");

    element.textContent = text;

    return element.innerHTML;
}

async function sendMessage() {
    const content =
        chatInput.value.trim();

    if (!content) {
        return;
    }

    if (!activeConversationId) {
        console.error(
            "No active conversation."
        );
        return;
    }

    try {
        const message =
            await apiRequest(
                `/chat/conversations/${activeConversationId}/messages/`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        content
                    })
                }
            );

        chatInput.value = "";

        await loadMessages(
            activeConversationId
        );

    } catch (error) {
        console.error(
            "Unable to send message:",
            error
        );
    }
}

if (chatForm) {
    chatForm.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            sendMessage();
        }
    );
}


function renderConversations() {
    const conversationList =
        document.querySelector(".conversation-list");

    if (!conversationList) {
        return;
    }

    conversationList.innerHTML = "";

    conversations.forEach(conversation => {
        const user =
            conversation.other_user;

        if (!user) {
            return;
        }

        const item =
            document.createElement("div");

        item.className =
            "conversation";

        item.dataset.userId =
            user.id;

        item.dataset.conversationId =
            conversation.id;

        item.innerHTML = `
            <div class="conversation-avatar">
                ${
                    user.profile_image
                        ? `<img src="${escapeHtml(user.profile_image)}" alt="">`
                        : escapeHtml(
                            getInitials(user.name)
                        )
                }
            </div>

            <div class="conversation-info">
                <div class="conversation-name">
                    ${escapeHtml(user.name)}
                </div>

                <div class="conversation-preview">
                    ${
                        conversation.last_message
                            ? escapeHtml(
                                conversation.last_message.content
                            )
                            : "No messages yet"
                    }
                </div>
            </div>
        `;

        item.addEventListener(
            "click",
            () => {
                openConversation(
                    conversation
                );
            }
        );

        conversationList.appendChild(item);
    });
}

function getInitials(name) {
    return String(name || "User")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part => part.charAt(0).toUpperCase()
        )
        .join("");
}

async function openConversation(conversation) {
    const user = conversation.other_user;

    if (!user) {
        return;
    }

    activeConversationId =
        conversation.id;

    chatUserName.textContent =
        user.name || "User";

    chatAvatar.innerHTML =
        user.profile_image
            ? `<img src="${escapeHtml(user.profile_image)}" alt="">`
            : escapeHtml(
                getInitials(user.name)
            );

    await loadMessages(
        activeConversationId
    );

    document
        .querySelectorAll(".conversation")
        .forEach(item => {
            item.classList.toggle(
                "active",
                Number(item.dataset.conversationId) ===
                Number(conversation.id)
            );
        });
}
