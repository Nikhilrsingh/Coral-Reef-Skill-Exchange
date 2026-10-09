import { API_BASE_URL } from "../services/apiConfig.js";
import authService from "../services/authService.js";

// API URL is shared with authentication and messaging through apiConfig.js.
// STUN helps establish direct connections; configure TURN for restrictive networks.
const token = authService.getToken();
const ICE_SERVERS = window.CORAL_REEF_ICE_SERVERS || [{ urls: "stun:stun.l.google.com:19302" }];

let activeCall = null;
let callRole = null;
let peerConnection = null;
let localStream = null;
let lastSignalId = 0;
let pollTimer = null;
let incomingTimer = null;
let negotiationStarted = false;
let handlingOffer = false;
let pendingIce = [];
let micMuted = false;
let cameraOff = false;
let incomingCheckBusy = false;
let callRingTimeout = null;
const CALL_RING_TIMEOUT_MS = 45000;

const $ = (selector) => document.querySelector(selector);

function buildCallUI() {
    const header = $(".chat-header");
    if (!header || $("#crCallOverlay")) return;

    // Reuse the call buttons already present in chat.html; create them only if absent.
    let audioButton = $("#voiceCallButton");
    let videoButton = $("#videoCallButton");
    if (!audioButton || !videoButton) {
        const actions = document.createElement("div");
        actions.className = "cr-call-actions";
        actions.innerHTML = `
          <button class="cr-call-btn" id="voiceCallButton" type="button" title="Start audio call">☎</button>
          <button class="cr-call-btn" id="videoCallButton" type="button" title="Start video call">▣</button>`;
        header.appendChild(actions);
        audioButton = $("#voiceCallButton");
        videoButton = $("#videoCallButton");
    }

    const overlay = document.createElement("div");
    overlay.className = "cr-call-overlay";
    overlay.id = "crCallOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="cr-call-card">
        <div class="cr-call-top"><div><div class="cr-call-title" id="crCallTitle">Call</div><div class="cr-call-status" id="crCallStatus">Connecting…</div></div></div>
        <div class="cr-call-videos">
          <div class="cr-call-video-wrap local"><video id="crLocalVideo" autoplay playsinline muted></video><span class="cr-call-video-label">You</span></div>
          <div class="cr-call-video-wrap remote"><video id="crRemoteVideo" autoplay playsinline></video><span class="cr-call-video-label" id="crRemoteLabel">Other person</span></div>
        </div>
        <div class="cr-call-error" id="crCallError" aria-live="polite"></div>
        <div class="cr-call-controls" id="crIncomingControls" hidden>
          <button class="cr-call-control primary" id="crAcceptCall" type="button">Accept</button>
          <button class="cr-call-control danger" id="crDeclineCall" type="button">Decline</button>
        </div>
        <div class="cr-call-controls" id="crActiveControls" hidden>
          <button class="cr-call-control" id="crMuteBtn" type="button">Mute mic</button>
          <button class="cr-call-control" id="crCameraBtn" type="button">Turn camera off</button>
          <button class="cr-call-control danger" id="crHangupBtn" type="button">End call</button>
        </div>
        <div class="cr-call-controls" id="crOutgoingControls" hidden>
          <button class="cr-call-control danger" id="crCancelCall" type="button">Cancel call</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    audioButton.addEventListener("click", () => startOutgoingCall("audio"));
    videoButton.addEventListener("click", () => startOutgoingCall("video"));
    $("#crAcceptCall").addEventListener("click", acceptIncomingCall);
    $("#crDeclineCall").addEventListener("click", () => finishCall("reject", "Call declined."));
    $("#crCancelCall").addEventListener("click", () => finishCall("end", "Call cancelled."));
    $("#crHangupBtn").addEventListener("click", () => finishCall("end", "Call ended."));
    $("#crMuteBtn").addEventListener("click", toggleMicrophone);
    $("#crCameraBtn").addEventListener("click", toggleCamera);
    updateCallButtons();
}

function setCallStatus(text) { const node = $("#crCallStatus"); if (node) node.textContent = text; }
function setCallError(text) { const node = $("#crCallError"); if (node) node.textContent = text || ""; }
function showOverlay(mode) {
    const overlay = $("#crCallOverlay");
    overlay.classList.toggle("audio-mode", activeCall?.call_type === "audio");
    overlay.classList.add("is-open");
    $("#crIncomingControls").hidden = mode !== "incoming";
    $("#crActiveControls").hidden = mode !== "active";
    $("#crOutgoingControls").hidden = mode !== "outgoing";
    $("#crCameraBtn").hidden = activeCall?.call_type !== "video";
}
function hideOverlay() { $("#crCallOverlay")?.classList.remove("is-open"); }
function updateCallButtons() {
    const hasConversation = Boolean($(".conversation.active")?.dataset.conversationId);
    if ($("#voiceCallButton")) $("#voiceCallButton").disabled = !token || !hasConversation || Boolean(activeCall);
    if ($("#videoCallButton")) $("#videoCallButton").disabled = !token || !hasConversation || Boolean(activeCall);
}

async function apiRequest(path, options = {}) {
    if (!token) throw new Error("Please log in again before calling.");
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}`, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.error || `Request failed (${response.status}).`);
    return data;
}

function activeConversationId() {
    const id = $(".conversation.active")?.dataset.conversationId;
    return id ? Number(id) : null;
}

async function startOutgoingCall(type) {
    if (activeCall) return;
    const conversationId = activeConversationId();
    if (!conversationId) { alert("Select a conversation first."); return; }
    try {
        activeCall = await apiRequest(`/chat/conversations/${conversationId}/calls/`, {
            method: "POST", body: JSON.stringify({ call_type: type }),
        });
        callRole = "caller";
        lastSignalId = 0;
        negotiationStarted = false;
        pendingIce = [];
        $("#crCallTitle").textContent = `${type === "video" ? "Video" : "Audio"} call`;
        $("#crRemoteLabel").textContent = activeCall.receiver.name;
        setCallStatus(`Calling ${activeCall.receiver.name}…`);
        setCallError("");
        showOverlay("outgoing");
        updateCallButtons();
        startCallPolling();
        callRingTimeout = window.setTimeout(() => {
            if (activeCall && callRole === "caller" && activeCall.status === "ringing") {
                finishCall("end", "No answer. Call ended.");
            }
        }, CALL_RING_TIMEOUT_MS);
    } catch (error) {
        alert(error.message);
    }
}

async function pollIncomingCalls() {
    if (!token || activeCall || incomingCheckBusy) return;
    incomingCheckBusy = true;
    try {
        const calls = await apiRequest("/chat/calls/incoming/");
        if (activeCall || !calls.length) return;
        const call = calls[0];
        activeCall = call;
        callRole = "receiver";
        lastSignalId = 0;
        negotiationStarted = false;
        pendingIce = [];
        $("#crCallTitle").textContent = `Incoming ${call.call_type} call`;
        $("#crRemoteLabel").textContent = call.caller.name;
        setCallStatus(`${call.caller.name} is calling you.`);
        setCallError("");
        showOverlay("incoming");
        updateCallButtons();
        startCallPolling();
    } catch (error) {
        console.warn("Incoming call check failed:", error.message);
    } finally {
        incomingCheckBusy = false;
    }
}

async function acceptIncomingCall() {
    if (!activeCall || callRole !== "receiver") return;
    try {
        await apiRequest(`/chat/calls/${activeCall.id}/action/`, { method: "POST", body: JSON.stringify({ action: "accept" }) });
        showOverlay("active");
        setCallStatus("Connecting…");
        await ensureLocalMedia();
        await ensurePeerConnection();
    } catch (error) {
        setCallError(error.message || "Could not access your camera or microphone.");
        setCallStatus("Unable to join call");
        try { await apiRequest(`/chat/calls/${activeCall.id}/action/`, { method: "POST", body: JSON.stringify({ action: "end" }) }); } catch (_) {}
        cleanupCall();
        alert(error.message || "Could not access your camera or microphone. Check browser permissions and use HTTPS on iPhone.");
    }
}

async function ensureLocalMedia() {
    if (localStream) return localStream;
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera/microphone access requires HTTPS or localhost in a supported browser.");
    }
    localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: activeCall.call_type === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });
    $("#crLocalVideo").srcObject = localStream;
    $("#crLocalVideo").play().catch(() => {});
    return localStream;
}

async function ensurePeerConnection() {
    if (peerConnection) return peerConnection;
    peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    localStream?.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = event => {
        const stream = event.streams?.[0];
        if (stream) {
            $("#crRemoteVideo").srcObject = stream;
            $("#crRemoteVideo").play().catch(() => setCallError("Tap the video area if your browser blocks playback."));
        }
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate && activeCall) sendSignal("ice", event.candidate.toJSON()).catch(err => console.warn("ICE signal failed:", err.message));
    };
    peerConnection.onconnectionstatechange = () => {
        if (!peerConnection) return;
        const state = peerConnection.connectionState;
        if (state === "connected") setCallStatus("Connected");
        else if (state === "connecting") setCallStatus("Connecting…");
        else if (state === "failed") setCallError("Connection failed. A TURN server may be required on this network.");
    };
    return peerConnection;
}

async function startCallerNegotiation() {
    if (negotiationStarted || callRole !== "caller" || !activeCall) return;
    negotiationStarted = true;
    try {
        await ensureLocalMedia();
        const pc = await ensurePeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal("offer", pc.localDescription.toJSON());
        showOverlay("active");
        setCallStatus("Connecting…");
    } catch (error) {
        setCallError(error.message || "Could not start the call.");
        setCallStatus("Call setup failed");
        try { await apiRequest(`/chat/calls/${activeCall.id}/action/`, { method: "POST", body: JSON.stringify({ action: "end" }) }); } catch (_) {}
        cleanupCall();
        alert(error.message || "Call setup failed. Check the network, browser permissions, and TURN configuration.");
    }
}

async function sendSignal(kind, payload) {
    if (!activeCall) return;
    return apiRequest(`/chat/calls/${activeCall.id}/signals/`, { method: "POST", body: JSON.stringify({ kind, payload }) });
}

async function handleSignal(signal) {
    if (signal.kind === "offer" && callRole === "receiver") {
        if (handlingOffer) return;
        handlingOffer = true;
        try {
            await ensureLocalMedia();
            const pc = await ensurePeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
            for (const candidate of pendingIce) await pc.addIceCandidate(new RTCIceCandidate(candidate));
            pendingIce = [];
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal("answer", pc.localDescription.toJSON());
            showOverlay("active");
            setCallStatus("Connecting…");
        } catch (error) {
            setCallError(error.message || "Could not answer the call.");
            try { await apiRequest(`/chat/calls/${activeCall.id}/action/`, { method: "POST", body: JSON.stringify({ action: "end" }) }); } catch (_) {}
            cleanupCall();
        } finally { handlingOffer = false; }
    } else if (signal.kind === "answer" && callRole === "caller" && peerConnection && !peerConnection.remoteDescription) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
        for (const candidate of pendingIce) await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        pendingIce = [];
    } else if (signal.kind === "ice") {
        // Candidates can arrive before the offer creates the peer connection. Queue them.
        if (!peerConnection || !peerConnection.remoteDescription) {
            pendingIce.push(signal.payload);
        } else {
            try { await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload)); }
            catch (error) { console.warn("Ignoring invalid/late ICE candidate:", error.message); }
        }
    }
}

async function pollActiveCall() {
    if (!activeCall) return;
    try {
        const result = await apiRequest(`/chat/calls/${activeCall.id}/signals/?after=${lastSignalId}`);
        activeCall = result.call;
        if (activeCall.status === "rejected") { setCallStatus("Call declined."); cleanupCall(); return; }
        if (activeCall.status === "ended") { setCallStatus("Call ended."); cleanupCall(); return; }
        if (activeCall.status === "accepted" && callRole === "caller" && !negotiationStarted) {
            $("#crCallTitle").textContent = `${activeCall.call_type === "video" ? "Video" : "Audio"} call`;
            $("#crRemoteLabel").textContent = activeCall.receiver.name;
            await startCallerNegotiation();
        }
        for (const signal of result.signals) {
            lastSignalId = Math.max(lastSignalId, signal.id);
            await handleSignal(signal);
        }
    } catch (error) {
        console.warn("Call signaling poll failed:", error.message);
    }
}

function startCallPolling() {
    stopCallPolling();
    pollTimer = window.setInterval(pollActiveCall, 900);
    pollActiveCall();
}
function stopCallPolling() { if (pollTimer) window.clearInterval(pollTimer); pollTimer = null; }

async function finishCall(action, message) {
    if (!activeCall) { cleanupCall(); return; }
    const callId = activeCall.id;
    try { await apiRequest(`/chat/calls/${callId}/action/`, { method: "POST", body: JSON.stringify({ action }) }); }
    catch (error) { console.warn("Could not update call status:", error.message); }
    if (message) setCallStatus(message);
    cleanupCall();
}

function cleanupCall() {
    stopCallPolling();
    if (callRingTimeout) window.clearTimeout(callRingTimeout);
    callRingTimeout = null;
    if (peerConnection) { peerConnection.ontrack = null; peerConnection.onicecandidate = null; peerConnection.onconnectionstatechange = null; peerConnection.close(); }
    peerConnection = null;
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    localStream = null;
    if ($("#crLocalVideo")) $("#crLocalVideo").srcObject = null;
    if ($("#crRemoteVideo")) $("#crRemoteVideo").srcObject = null;
    activeCall = null; callRole = null; lastSignalId = 0; negotiationStarted = false; handlingOffer = false; pendingIce = []; micMuted = false; cameraOff = false;
    if ($("#crMuteBtn")) $("#crMuteBtn").textContent = "Mute mic";
    if ($("#crCameraBtn")) $("#crCameraBtn").textContent = "Turn camera off";
    hideOverlay(); updateCallButtons();
}

function toggleMicrophone() {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;
    micMuted = !micMuted; track.enabled = !micMuted;
    $("#crMuteBtn").textContent = micMuted ? "Unmute mic" : "Mute mic";
}
function toggleCamera() {
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;
    cameraOff = !cameraOff; track.enabled = !cameraOff;
    $("#crCameraBtn").textContent = cameraOff ? "Turn camera on" : "Turn camera off";
}

// chat.js marks the selected conversation with .active after a row is clicked.
document.addEventListener("click", event => {
    if (event.target.closest(".conversation")) window.setTimeout(updateCallButtons, 50);
});

if (token) {
    buildCallUI();
    incomingTimer = window.setInterval(pollIncomingCalls, 1800);
    pollIncomingCalls();
} else {
    console.warn("Sign in is required for calls.");
}
