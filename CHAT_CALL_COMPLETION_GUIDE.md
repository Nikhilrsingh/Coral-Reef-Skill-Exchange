# Coral Reef — Chat, mobile layout, and real-time calling

This update aligns the chat HTML/CSS/JavaScript, fixes the call controls' `hidden` behavior, queues early ICE candidates, adds a ringing timeout, and centralizes the API URL used by authentication, chat, and calls.

## 1. Keep a backup

Extract this archive into a new folder. Do not overwrite the project you are currently using until you have tested this version.

## 2. Run locally on the Mac

### Backend terminal

```bash
cd ~/Desktop/Coral-Reef-Major-Project/07_Backend
```

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

```bash
pip install -r requirements.txt
```

```bash
python manage.py migrate
```

```bash
python manage.py check
```

```bash
python manage.py runserver 0.0.0.0:8000
```

Keep the backend terminal open. The call feature uses the `call_management` Django app and its migration, included in this project.

### Frontend terminal

```bash
cd ~/Desktop/Coral-Reef-Major-Project/06_Frontend
```

```bash
python3 -m http.server 5500 --bind 0.0.0.0
```

On the Mac, open `http://127.0.0.1:5500/pages/login.html`. Sign in, then open Messages. Use two different accounts, and make sure they have an accepted connection before trying to chat or call.

## 3. Test messaging

1. Sign in as account A in one browser profile.
2. Sign in as account B in another browser profile or on a second device.
3. Open their conversation from either side.
4. Send messages in both directions. The active conversation polls for new messages approximately every 2.2 seconds; conversation previews refresh approximately every 7 seconds.
5. On a phone-sized viewport, the inbox should be the first screen. Select a conversation to open it, then use the back arrow to return to the inbox.

## 4. Test calls on the Mac first

`localhost` is treated as a secure context by modern browsers, so start with two separate browser profiles on the Mac if possible. Alternatively, use two devices over HTTPS as described below.

1. Account A opens the conversation and clicks the phone or video button.
2. Account B opens Coral Reef while signed in. An incoming-call dialog should appear with **Accept** and **Decline** only.
3. Account B accepts. Grant microphone/camera permission when prompted.
4. Wait for the status to change to Connected. Verify audio in both directions. For video, verify both local and remote video.
5. Test mute, camera toggle, decline, cancel, and end-call controls.
6. If the other account does not answer, the outgoing call should end after about 45 seconds.

### What the calling code does

- Uses the Django call session and signaling endpoints under `/api/chat/`.
- Negotiates WebRTC offers/answers and exchanges ICE candidates through authenticated API polling.
- Queues ICE candidates that arrive before a remote description is available.
- Stops local media tracks and closes the peer connection when a call ends.

## 5. Important: testing from an iPhone

**An ordinary `http://172.x.x.x:5500` LAN page generally cannot access the iPhone camera/microphone.** Real calls require HTTPS on the phone (or `localhost` on the same device). Do not treat a visible call dialog as proof that media is connected.

For a proper phone test, use HTTPS URLs for both the frontend and backend (for example, temporary HTTPS tunnels during development):

1. Start the frontend on port `5500` and backend on port `8000`.
2. Create one HTTPS tunnel to port `5500` and another HTTPS tunnel to port `8000` using a trusted tunnel provider.
3. Add the backend tunnel hostname to `DJANGO_ALLOWED_HOSTS` before starting Django, e.g. `DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,172.20.10.2,your-backend-host.example"`. Use the actual hostname assigned by your tunnel provider.
4. Open `06_Frontend/js/services/apiConfig.js` and set `API_BASE_URL_OVERRIDE` to the backend HTTPS URL ending in `/api`, e.g. `https://your-backend-host.example/api`. This one setting is shared by login/authentication, chat, and calling.
5. Reload the frontend using its HTTPS tunnel URL on both devices. Sign in on both devices again if needed.
6. Check the backend terminal and browser Console/Network panel if any call fails.

For a public deployment, configure the actual frontend origin in Django CORS settings and the backend hostname in `DJANGO_ALLOWED_HOSTS`; do not leave development-wide CORS enabled in production.

## 6. TURN server requirement

This project includes a public STUN server for direct peer-to-peer negotiation. STUN alone does **not** guarantee calls across all mobile carriers, corporate networks, VPNs, or restrictive NATs. For reliable production calls, provision a TURN service and configure the ICE servers in `06_Frontend/js/modules/call.js` (the `ICE_SERVERS` constant). Use credentials issued for your application; do not publish a permanent TURN secret in a public repository.

## 7. Verification performed for this archive

- Changed JavaScript files passed Node.js syntax checks.
- All 107 Python files passed Python syntax compilation.
- ZIP archive integrity was checked after packaging.
- A live Django `manage.py check` and an end-to-end two-device audio/video call could not be performed in this build environment because Django is not installed here and the devices/network are not available. Run the commands above and test both devices before treating the feature as production-ready.

## Troubleshooting

- **Incoming dialog has Accept/Decline while the caller is still ringing:** hard-refresh both pages; the updated call CSS enforces the HTML `hidden` attribute for inactive controls.
- **Call connects but there is no sound/video:** confirm both devices granted microphone/camera permissions, use HTTPS on iPhone, and inspect the Console. Try a TURN server if ICE connection fails.
- **`Invalid HTTP_HOST header`:** add the exact backend hostname to `DJANGO_ALLOWED_HOSTS` and restart Django.
- **401 / sign-in required:** sign in again on each device; each browser/device has its own local token.
- **Call API returns 404:** run `python manage.py migrate`, verify `call_management` is in `INSTALLED_APPS`, and confirm `path("api/chat/", include("call_management.urls"))` is in `coralreef/urls.py`.
