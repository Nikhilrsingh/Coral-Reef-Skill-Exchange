# Coral Reef — Frontend & Backend Setup / QA Guide

This package contains the current HTML/CSS/JavaScript frontend and Django REST Framework backend, including the fixes made in this revision.

## Important: what is and is not included

- Text chat uses authenticated Django REST API endpoints and database-backed messages.
- The chat page refreshes active conversation messages and the conversation list periodically while the page is visible. This is polling, not a WebSocket push connection.
- Voice/video calling uses browser WebRTC media and Django-backed call signaling. It is a real implementation, but successful media connectivity depends on browser permissions, HTTPS, network/firewall behavior, and ICE/TURN configuration.
- File attachments are **not enabled**. The interface explicitly tells the user a file has not been uploaded rather than pretending the upload succeeded.
- This package has been statically checked, but it has not been possible to run the Django server or complete a two-device call test in this build environment. Do not treat static checks as proof of end-to-end operation.

## Requirements

- Python version compatible with the pinned Django version in `07_Backend/requirements.txt`
- A modern browser
- For calls from a phone or remote device: serve the frontend over HTTPS, and configure a TURN server for reliable connectivity across restrictive networks.

## First-time setup on macOS

Open Terminal:

```bash
cd ~/Desktop/Coral-Reef-Major-Project/07_Backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
python -m pip install --upgrade pip
```

```bash
pip install -r requirements.txt
```

Apply database migrations:

```bash
python manage.py migrate
```

Check Django configuration:

```bash
python manage.py check
```

Create an admin account if needed:

```bash
python manage.py createsuperuser
```

Run the backend on the local network:

```bash
python manage.py runserver 0.0.0.0:8000
```

Open a second Terminal window:

```bash
cd ~/Desktop/Coral-Reef-Major-Project/06_Frontend
```

Run the frontend:

```bash
python3 -m http.server 5500 --bind 0.0.0.0
```

On the Mac, open `http://127.0.0.1:5500/`. On a phone connected to the same network, open `http://YOUR-MAC-IP:5500/`.

### Mobile API host and allowed hosts

The frontend builds its API base URL from the hostname used to open the frontend and port `8000`. If you open the site on a phone using the Mac's LAN IP, API requests go to that same IP on port `8000`.

Django `ALLOWED_HOSTS` is configured through `DJANGO_ALLOWED_HOSTS`. If the Mac's LAN IP changes, set the new address when starting Django, for example:

```bash
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,172.20.10.2 python manage.py runserver 0.0.0.0:8000
```

Replace `172.20.10.2` with the current output of `ipconfig getifaddr en0` (or `en1` if the active interface is different). Do not hard-code a changing local IP into the frontend source.

## Test chat with two accounts

1. Start Django and the frontend.
2. Create or use two separate user accounts.
3. Complete the platform's connection/request flow so the two users have an accepted connection. The backend only permits creating a conversation for accepted connections.
4. Sign in as account A and open the chat page. Start/select the conversation with account B.
5. Send a text message. Confirm it appears in the thread.
6. Sign in as account B in a separate browser profile/device and open the same conversation.
7. Confirm the message appears without manually refreshing; send a reply and verify account A receives it.
8. Refresh the page and verify that message history remains.
9. Test empty messages and a signed-out session; neither should silently succeed.

## Test voice/video calls

1. Use two separate signed-in accounts with an existing conversation.
2. Open the application in two different browser profiles/devices. Avoid using the same account in both windows.
3. For local desktop testing, `localhost` is a secure context in supported browsers. For iPhone camera/microphone testing, use a trusted HTTPS origin; plain `http://MAC-LAN-IP:5500` normally will not allow camera/microphone access.
4. Grant microphone permission for audio calls and microphone plus camera permission for video calls.
5. Select the same conversation on both accounts.
6. From account A, start an audio or video call. Account B should receive the incoming call UI and can accept or decline.
7. After accepting, verify that both sides can hear each other. For video, verify both local preview and remote video.
8. Test mute/unmute, camera off/on, hang up, decline, no-answer timeout, and making a new call after the previous one ends.
9. Check both browser consoles and the Django terminal for errors if a step fails.

### Call reliability and TURN

The default configuration includes a public STUN server. STUN alone is not sufficient for every network, mobile carrier, VPN, or firewall. For reliable production calls, obtain a TURN service and configure `window.CORAL_REEF_ICE_SERVERS` **before** `js/modules/call.js` loads. Use credentials that are temporary or generated server-side; do not commit permanent TURN credentials to a public repository. Example shape:

```javascript
window.CORAL_REEF_ICE_SERVERS = [
  { urls: "stun:your-stun-host:3478" },
  {
    urls: "turn:your-turn-host:3478",
    username: "short-lived-username",
    credential: "short-lived-password"
  }
];
```

Replace the example values with valid credentials from your TURN provider. A TURN service must be configured and tested before promising calls will work on all networks.

## Checks performed in this package

- JavaScript syntax check (`node --check`) across frontend JavaScript files.
- Python source compilation (syntax only; does not import Django).
- ZIP integrity check.

These are not a substitute for running `python manage.py check`, backend tests, and a real two-device call test on the target environment.
