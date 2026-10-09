import authService from "../services/authService.js";

const API_BASE_URL = "http://172.20.10.2:8000/api";
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
const attachmentInput = $("attachmentInput");
const selectedFile = $("selectedFile");
let conversations = [];
let activeConversationId = null;
let activeConversation = null;
let currentUserId = null;
let selectedAttachment = null;

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
      ...(options.headers || {})
    }
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.error || "Request failed.");
  return data;
}
function escapeHtml(value) {
  const el = document.createElement("span");
  el.textContent = String(value ?? "");
  return el.innerHTML;
}
function getInitials(name) {
  return String(name || "User").trim().split(/\s+/).slice(0,2).map(s=>s[0]?.toUpperCase()||"").join("");
}
function showModal(title, text, icon = "✦") {
  $("chatModalTitle").textContent = title;
  $("chatModalText").textContent = text;
  $("chatModalIcon").textContent = icon;
  $("chatModal").hidden = false;
}
function closeModal() { $("chatModal").hidden = true; }
function showInlineError(message) {
  let node = $("chatInlineError");
  if (!node) {
    node = document.createElement("div");
    node.id = "chatInlineError";
    node.className = "chat-inline-error";
    node.style.cssText = "padding:8px 12px;color:#b42318;background:#fff1f0;border-top:1px solid #ffd8d5;font-size:12px";
    $("conversationPanel").insertBefore(node, $("chatForm"));
  }
  node.textContent = message;
}
function clearInlineError() { $("chatInlineError")?.remove(); }

async function init() {
  try {
    const user = await authService.getCurrentUserFromAPI();
    currentUserId = user.id;
    await loadConversations();
    await openSelectedConversation();
  } catch (error) {
    console.error("Unable to initialize chat:", error);
    conversationList.innerHTML = `<div class="inbox-empty">Could not load conversations. Check that the backend is running and you are logged in, then refresh.</div>`;
    showInlineError(error.message || "Could not connect to the chat service.");
  }
}
async function loadConversations() {
  const data = await apiRequest("/chat/conversations/");
  conversations = Array.isArray(data) ? data : (data?.results || []);
  renderConversations();
}
function renderConversations() {
  const query = (conversationSearch?.value || "").trim().toLowerCase();
  const filtered = conversations.filter(c => {
    const u = c.other_user || {};
    return `${u.name || ""} ${c.last_message?.content || ""}`.toLowerCase().includes(query);
  });
  $("conversationCount").textContent = String(conversations.length);
  if (!filtered.length) {
    conversationList.innerHTML = `<div class="inbox-empty">${query ? "No conversations match your search." : "No conversations yet. Connect with a learning partner from Matches to start a chat."}</div>`;
    return;
  }
  conversationList.innerHTML = "";
  filtered.forEach(conversation => {
    const user = conversation.other_user;
    if (!user) return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "conversation" + (Number(conversation.id) === Number(activeConversationId) ? " active" : "");
    item.dataset.conversationId = conversation.id;
    const avatar = user.profile_image
      ? `<img src="${escapeHtml(user.profile_image)}" alt="">`
      : escapeHtml(getInitials(user.name));
    item.innerHTML = `<div class="conversation-avatar">${avatar}</div>
      <div class="conversation-info"><div class="conversation-name">${escapeHtml(user.name || "Learning partner")}</div>
      <div class="conversation-preview">${escapeHtml(conversation.last_message?.content || "Start exchanging ideas")}</div></div>`;
    item.addEventListener("click", () => openConversation(conversation));
    conversationList.appendChild(item);
  });
}
async function openSelectedConversation() {
  const userId = new URLSearchParams(location.search).get("user");
  if (!userId) return;
  let found = conversations.find(c => Number(c.other_user?.id) === Number(userId));
  if (!found) {
    try {
      found = await apiRequest("/chat/conversations/", {
        method:"POST", body:JSON.stringify({receiver:Number(userId)})
      });
      if (!conversations.some(c => Number(c.id) === Number(found.id))) conversations.unshift(found);
      renderConversations();
    } catch (error) {
      console.error("Could not create conversation:", error);
      showInlineError(error.message || "Could not start this conversation.");
      return;
    }
  }
  await openConversation(found);
}
async function openConversation(conversation) {
  const user = conversation?.other_user;
  if (!user) return;
  activeConversation = conversation;
  activeConversationId = conversation.id;
  chatUserName.textContent = user.name || "Learning partner";
  chatAvatar.innerHTML = user.profile_image
    ? `<img src="${escapeHtml(user.profile_image)}" alt="">`
    : escapeHtml(getInitials(user.name));
  chatUserStatus.innerHTML = "<i></i><span>Your learning conversation</span>";
  document.querySelectorAll(".conversation").forEach(item =>
    item.classList.toggle("active", Number(item.dataset.conversationId) === Number(conversation.id))
  );
  chatShell.classList.add("mobile-chat-open");
  clearInlineError();
  await loadMessages(conversation.id);
}
async function loadMessages(conversationId) {
  try {
    const data = await apiRequest(`/chat/conversations/${conversationId}/messages/`);
    renderMessages(Array.isArray(data) ? data : (data?.results || []));
    clearInlineError();
  } catch (error) {
    console.error("Unable to load messages:", error);
    messagesArea.innerHTML = `<div class="inbox-empty">Messages could not be loaded. Check your connection and try Refresh messages.</div>`;
    showInlineError(error.message || "Could not load messages.");
  }
}
function renderMessages(messages) {
  messagesArea.innerHTML = "";
  if (!messages.length) {
    messagesArea.innerHTML = `<div class="welcome-card"><div class="welcome-orbit"><div class="welcome-logo">CR</div></div><div class="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</div><h3>Your conversation starts here.</h3><p>Say hello, share a question, or help your learning partner discover something new.</p></div>`;
    return;
  }
  messages.forEach(message => {
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
      time.textContent = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
      row.appendChild(time);
    }
    messagesArea.appendChild(row);
  });
  messagesArea.scrollTop = messagesArea.scrollHeight;
}
async function sendMessage() {
  const content = chatInput.value.trim();
  if (!content) return;
  if (!activeConversationId) {
    showModal("Choose a conversation", "Select a learning partner before sending a message.", "✉");
    return;
  }
  const button = $("sendButton");
  button.disabled = true;
  try {
    await apiRequest(`/chat/conversations/${activeConversationId}/messages/`, {
      method:"POST", body:JSON.stringify({content})
    });
    chatInput.value = "";
    await loadMessages(activeConversationId);
    const index = conversations.findIndex(c => Number(c.id) === Number(activeConversationId));
    if (index >= 0) {
      conversations[index].last_message = {content};
      const [latest] = conversations.splice(index, 1);
      conversations.unshift(latest);
      renderConversations();
    }
  } catch (error) {
    console.error("Unable to send message:", error);
    showInlineError(error.message || "Message could not be sent. Please try again.");
  } finally {
    button.disabled = false;
    chatInput.focus();
  }
}

chatForm?.addEventListener("submit", event => { event.preventDefault(); sendMessage(); });
conversationSearch?.addEventListener("input", renderConversations);
$("refreshConversations")?.addEventListener("click", async () => {
  const button = $("refreshConversations");
  button.disabled = true;
  try { await loadConversations(); }
  catch (error) { showInlineError(error.message || "Could not refresh conversations."); }
  finally { button.disabled = false; }
});
$("mobileBack")?.addEventListener("click", () => chatShell.classList.remove("mobile-chat-open"));
$("refreshMessagesButton")?.addEventListener("click", () => {
  $("conversationMenu").hidden = true;
  $("conversationMenuButton").setAttribute("aria-expanded","false");
  if (activeConversationId) loadMessages(activeConversationId);
  else showModal("No conversation selected", "Choose a conversation first.", "↻");
});
$("conversationMenuButton")?.addEventListener("click", () => {
  const menu = $("conversationMenu");
  menu.hidden = !menu.hidden;
  $("conversationMenuButton").setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("click", event => {
  if (!event.target.closest(".options-wrap")) {
    $("conversationMenu").hidden = true;
    $("conversationMenuButton").setAttribute("aria-expanded","false");
  }
  if (!event.target.closest(".composer-tools")) $("emojiPopover").hidden = true;
});
$("contactInfoButton")?.addEventListener("click", () => {
  $("conversationMenu").hidden = true;
  const u = activeConversation?.other_user;
  showModal(u ? (u.name || "Learning partner") : "Contact information",
    u ? "This is your Coral Reef learning partner. Contact details can be added here when the profile API exposes them." : "Select a conversation to view partner information.", "◉");
});
$("voiceCallButton")?.addEventListener("click", () => showModal("Voice calls", activeConversation ? "The voice-call interface is ready for integration, but live calls require WebRTC signaling and a backend call service. No call has been placed." : "Choose a learning partner first. Live calls also require WebRTC signaling and a backend call service.", "☎"));
$("videoCallButton")?.addEventListener("click", () => showModal("Video calls", activeConversation ? "The video-call interface is ready for integration, but live video requires WebRTC signaling, permissions, and a backend call service. No call has been started." : "Choose a learning partner first. Live video also requires WebRTC signaling and a backend call service.", "▣"));
$("closeChatModal")?.addEventListener("click", closeModal);
$("chatModalOk")?.addEventListener("click", closeModal);
$("chatModal")?.addEventListener("click", event => { if (event.target === $("chatModal")) closeModal(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeModal(); $("emojiPopover").hidden = true; $("conversationMenu").hidden = true; }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault(); conversationSearch?.focus();
  }
});
$("attachmentButton")?.addEventListener("click", () => {
  if (!activeConversationId) {
    showModal("Choose a conversation", "Select a learning partner before choosing a file.", "📎");
    return;
  }
  attachmentInput.click();
});
attachmentInput?.addEventListener("change", () => {
  selectedAttachment = attachmentInput.files?.[0] || null;
  if (!selectedAttachment) { selectedFile.hidden = true; return; }
  selectedFile.textContent = `📎 ${selectedAttachment.name}`;
  selectedFile.hidden = false;
  showModal("File selected", `${selectedAttachment.name} is selected. File upload is not enabled yet because the current backend has no attachment-storage endpoint. Your file has not been uploaded or shared.`, "📎");
  attachmentInput.value = "";
});
$("emojiButton")?.addEventListener("click", () => { $("emojiPopover").hidden = !$("emojiPopover").hidden; });
document.querySelectorAll("[data-emoji]").forEach(button => button.addEventListener("click", () => {
  const emoji = button.dataset.emoji;
  const start = chatInput.selectionStart ?? chatInput.value.length;
  const end = chatInput.selectionEnd ?? chatInput.value.length;
  chatInput.value = chatInput.value.slice(0,start) + emoji + chatInput.value.slice(end);
  chatInput.focus();
  chatInput.setSelectionRange(start + emoji.length, start + emoji.length);
  $("emojiPopover").hidden = true;
}));
init();
