import { API_BASE_URL } from "../services/apiConfig.js";
import authService from "../services/authService.js";

const token = authService.getToken();
if (!token) window.location.href = "login.html";

const $ = (id) => document.getElementById(id);
const chatForm = $("chatForm");
const chatInput = $("chatInput");
const messagesArea = $("messagesArea");
const conversationSearch = $("conversationSearch");
const chatUserName = $("chatUserName");
const chatAvatar = $("chatAvatar");
const chatUserStatus = $("chatUserStatus");
const conversationList = $("conversationList");
const chatShell = document.querySelector(".chat-shell");
const sendButton = chatForm?.querySelector('button[type="submit"]');

let conversations = [];
let activeConversationId = null;
let activeConversation = null;
let currentUserId = null;
let messagesPollTimer = null;
let conversationsPollTimer = null;
let isSending = false;
let isLoadingMessages = false;
let lastMessageSignature = "";

async function apiRequest(endpoint, options = {}) {
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Token ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      authService.logout();
      window.location.href = "login.html";
    }
    throw new Error(data?.detail || data?.error || `Request failed (${response.status}).`);
  }
  return data;
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}
function initials(name) {
  return String(name || "User").trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("");
}
function setInlineError(message) {
  let node = $("chatInlineError");
  if (!node) {
    node = document.createElement("div");
    node.id = "chatInlineError";
    node.className = "chat-inline-error";
    node.setAttribute("role", "status");
    const composer = chatForm;
    if (composer?.parentElement) composer.parentElement.insertBefore(node, composer);
    else messagesArea?.after(node);
  }
  if (node) node.textContent = message;
}
function clearInlineError() { $("chatInlineError")?.remove(); }
function showEmptyMessages() {
  messagesArea.innerHTML = `<div class="empty-chat"><div class="empty-chat-visual" aria-hidden="true"><span class="empty-chat-main-icon">✉</span></div><div class="empty-chat-content"><span class="empty-chat-kicker">A LITTLE KNOWLEDGE GOES A LONG WAY</span><h2>Your next great conversation starts here.</h2><p>Say hello, share a question, or help your learning partner discover something new.</p></div></div>`;
}
function renderConversations() {
  if (!conversationList) return;
  const query = (conversationSearch?.value || "").trim().toLowerCase();
  const valid = conversations.filter(item => item?.other_user);
  const filtered = valid.filter(item => {
    const user = item.other_user;
    return `${user.name || ""} ${item.last_message?.content || ""}`.toLowerCase().includes(query);
  });
  const count = $("conversationCount");
  if (count) count.textContent = String(valid.length);
  conversationList.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "conversation-loading";
    empty.textContent = query ? "No conversations match your search." : "No conversations yet. Connect with a learning partner to start chatting.";
    conversationList.appendChild(empty);
    return;
  }
  for (const conversation of filtered) {
    const user = conversation.other_user;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "conversation";
    item.dataset.conversationId = String(conversation.id);
    item.setAttribute("aria-label", `Open conversation with ${user.name || "learning partner"}`);
    item.classList.toggle("active", Number(conversation.id) === Number(activeConversationId));
    const avatar = document.createElement("span");
    avatar.className = "conversation-avatar";
    if (user.profile_image) {
      const img = document.createElement("img");
      img.src = user.profile_image;
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => { avatar.textContent = initials(user.name); };
      avatar.appendChild(img);
    } else avatar.textContent = initials(user.name);
    const info = document.createElement("span");
    info.className = "conversation-info";
    const name = document.createElement("span");
    name.className = "conversation-name";
    name.textContent = user.name || "Learning partner";
    const preview = document.createElement("span");
    preview.className = "conversation-preview";
    preview.textContent = conversation.last_message?.content || "Start a conversation";
    info.append(name, preview);
    item.append(avatar, info);
    item.addEventListener("click", () => openConversation(conversation));
    conversationList.appendChild(item);
  }
}

async function loadConversations({ quiet = false } = {}) {
  try {
    const data = await apiRequest("/chat/conversations/");
    const next = Array.isArray(data) ? data : (data?.results || []);
    conversations = next;
    renderConversations();
    if (activeConversationId) {
      const fresh = conversations.find(item => Number(item.id) === Number(activeConversationId));
      if (fresh) activeConversation = fresh;
    }
  } catch (error) {
    if (!quiet) setInlineError(error.message || "Could not load conversations.");
    console.error("Conversation refresh failed:", error);
  }
}

async function loadMessages(conversationId, { quiet = false } = {}) {
  if (!conversationId || isLoadingMessages) return;
  isLoadingMessages = true;
  try {
    const data = await apiRequest(`/chat/conversations/${conversationId}/messages/`);
    const messages = Array.isArray(data) ? data : (data?.results || []);
    if (Number(conversationId) !== Number(activeConversationId)) return;
    const signature = messages.map(message => `${message.id}:${message.updated_at || message.created_at}:${message.content}`).join("|");
    if (signature !== lastMessageSignature) {
      const nearBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 100;
      lastMessageSignature = signature;
      renderMessages(messages);
      if (nearBottom || messages.length < 2) messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    clearInlineError();
  } catch (error) {
    if (!quiet) setInlineError(error.message || "Messages could not be loaded.");
    console.error("Message refresh failed:", error);
  } finally {
    isLoadingMessages = false;
  }
}

function renderMessages(messages) {
  messagesArea.replaceChildren();
  if (!messages.length) { showEmptyMessages(); return; }
  const fragment = document.createDocumentFragment();
  for (const message of messages) {
    const sent = Number(message.sender) === Number(currentUserId);
    const row = document.createElement("div");
    row.className = `message ${sent ? "sent" : "received"}`;
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.content || "";
    row.appendChild(bubble);
    if (message.created_at) {
      const time = document.createElement("span");
      time.className = "message-time";
      const date = new Date(message.created_at);
      time.textContent = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      time.title = Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
      row.appendChild(time);
    }
    fragment.appendChild(row);
  }
  messagesArea.appendChild(fragment);
}

async function openConversation(conversation) {
  if (!conversation?.other_user) return;
  activeConversation = conversation;
  activeConversationId = conversation.id;
  lastMessageSignature = "";
  chatUserName.textContent = conversation.other_user.name || "Learning partner";
  chatAvatar.innerHTML = conversation.other_user.profile_image
    ? `<img src="${escapeHtml(conversation.other_user.profile_image)}" alt="">`
    : escapeHtml(initials(conversation.other_user.name));
  chatUserStatus.textContent = "Your learning conversation";
  document.querySelectorAll(".conversation").forEach(item => {
    item.classList.toggle("active", Number(item.dataset.conversationId) === Number(conversation.id));
  });
  chatShell?.classList.add("mobile-chat-open");
  clearInlineError();
  await loadMessages(conversation.id);
  chatInput?.focus({ preventScroll: true });
}

async function openFromQuery() {
  const userId = new URLSearchParams(window.location.search).get("user");
  if (!userId) return;
  let conversation = conversations.find(item => Number(item.other_user?.id) === Number(userId));
  if (!conversation) {
    try {
      conversation = await apiRequest("/chat/conversations/", { method: "POST", body: JSON.stringify({ receiver: Number(userId) }) });
      conversations.unshift(conversation);
    } catch (error) {
      setInlineError(error.message || "Could not start this conversation. You may need an accepted connection first.");
      return;
    }
  }
  renderConversations();
  await openConversation(conversation);
}

async function sendMessage() {
  const content = chatInput?.value.trim();
  if (!content || !activeConversationId || isSending) return;
  isSending = true;
  if (sendButton) sendButton.disabled = true;
  try {
    const message = await apiRequest(`/chat/conversations/${activeConversationId}/messages/`, { method: "POST", body: JSON.stringify({ content }) });
    chatInput.value = "";
    clearInlineError();
    const index = conversations.findIndex(item => Number(item.id) === Number(activeConversationId));
    if (index >= 0) conversations[index].last_message = message;
    renderConversations();
    await loadMessages(activeConversationId);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  } catch (error) {
    setInlineError(error.message || "Message could not be sent. Please try again.");
  } finally {
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    chatInput?.focus({ preventScroll: true });
  }
}

async function init() {
  if (!token) return;
  try {
    const user = await authService.getCurrentUserFromAPI();
    if (!user?.id) throw new Error("Your session could not be verified. Please sign in again.");
    currentUserId = user.id;
    await loadConversations();
    await openFromQuery();
  } catch (error) {
    setInlineError(error.message || "Could not initialize messaging.");
    console.error("Chat initialization failed:", error);
  }
  conversationsPollTimer = window.setInterval(() => loadConversations({ quiet: true }), 7000);
  messagesPollTimer = window.setInterval(() => {
    if (activeConversationId && document.visibilityState === "visible") loadMessages(activeConversationId, { quiet: true });
  }, 2200);
}

chatForm?.addEventListener("submit", event => { event.preventDefault(); sendMessage(); });
conversationSearch?.addEventListener("input", renderConversations);
$("mobileBackButton")?.addEventListener("click", () => chatShell?.classList.remove("mobile-chat-open"));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    loadConversations({ quiet: true });
    if (activeConversationId) loadMessages(activeConversationId, { quiet: true });
  }
});
window.addEventListener("beforeunload", () => {
  if (messagesPollTimer) clearInterval(messagesPollTimer);
  if (conversationsPollTimer) clearInterval(conversationsPollTimer);
});
init();
