# MARZ PWA Setup Guide

## Overview

The MARZ Progressive Web App (PWA) enables you to access MARZ on your mobile phone with native app-like features including:

- ✅ **Install on home screen** - No app store required
- ✅ **Voice commands** - "Hey MARZ" to wake up
- ✅ **Video chat** - See MARZ while you talk
- ✅ **Voice chat** - Natural conversation
- ✅ **Offline support** - Works without internet (cached UI)
- ✅ **Push notifications** - Get alerts from MARZ

---

## Quick Start

### 1. Deploy the PWA

```bash
# Commit and push changes
git add .
git commit -m "feat: Add MARZ PWA with voice commands and video chat"
git push origin main

# Trigger Cloud Build
gcloud builds submit --config cloudbuild.yaml --project opsvantage-ai-builder
```

### 2. Install on Mobile

#### Android (Chrome)
1. Open `https://opsvantage-ai-builder-xge3xydmha-ez.a.run.app/marz/chat`
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. Confirm installation
4. MARZ icon appears on home screen

#### iOS (Safari)
1. Open `https://opsvantage-ai-builder-xge3xydmha-ez.a.run.app/marz/chat`
2. Tap the Share button (square with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap "Add" in top right
5. MARZ icon appears on home screen

---

## Voice Commands

### Wake Commands
- **"Hey MARZ"** - Wake up MARZ
- **"OK MARZ"** - Wake up MARZ
- **"Wake up MARZ"** - Wake up MARZ

### Video Controls
- **"Turn on video"** - Enable video stream
- **"Turn off video"** - Disable video stream
- **"Enable video"** - Enable video stream
- **"Disable video"** - Disable video stream

### Audio Controls
- **"Mute"** - Mute audio
- **"Unmute"** - Unmute audio
- **"Turn off audio"** - Mute audio
- **"Turn on audio"** - Unmute audio

### Exit Commands
- **"Stop"** - Disconnect from MARZ
- **"Goodbye"** - Disconnect from MARZ
- **"Bye"** - Disconnect from MARZ

---

## Features

### Main Interface

1. **Connection Status** - Top bar shows connection (green = connected)
2. **Video Stream** - MARZ video appears when enabled
3. **Chat Messages** - Conversation history
4. **Voice Button** - Tap to start/stop voice recognition
5. **Text Input** - Type messages manually
6. **Controls**:
   - Video toggle
   - Audio toggle
   - Power (connect/disconnect)

### Voice Transcription

When you speak, your words appear in real-time above the input field. MARZ processes commands as you speak.

### Video Chat

- Tap the **Video** button to enable
- MARZ's video stream appears at the top
- Video automatically plays when received
- Tap again to disable

### Audio Chat

- Audio plays automatically when MARZ responds
- Tap the **Audio** button to mute/unmute
- Uses device speakers or headphones

---

## PWA Features

### Offline Support

The service worker caches:
- App shell (UI components)
- Previous conversations
- Static assets

When offline:
- UI still loads
- Previous messages visible
- New messages queued for when online

### Push Notifications

MARZ can send you notifications:
- When she has a response
- System alerts
- Reminders

To enable:
1. Tap "Allow" when prompted
2. Or go to browser settings → Notifications

### Home Screen Shortcuts

Long-press the MARZ icon for quick actions:
- **Wake MARZ** - Direct wake command
- **Video Chat** - Start with video enabled

---

## Troubleshooting

### PWA Won't Install

**Chrome Android:**
- Make sure you're on HTTPS
- Clear browser cache
- Try incognito mode

**Safari iOS:**
- iOS 11.3+ required
- Make sure "Add to Home Screen" is enabled
- Check Settings → Safari → Advanced

### Voice Commands Not Working

**Check:**
1. Microphone permission granted
2. Using Chrome or Edge (best support)
3. Internet connection active
4. Speaking clearly

**Fix:**
- Go to browser settings → Site permissions → Microphone
- Enable for the MARZ URL
- Refresh the page

### Video Not Playing

**Check:**
1. Video toggle enabled (green)
2. MARZ is connected (green status)
3. Browser supports WebM video
4. Sufficient bandwidth

**Fix:**
- Toggle video off/on
- Reconnect to MARZ
- Check network connection

### Audio Not Playing

**Check:**
1. Audio toggle enabled (green)
2. Device not on silent/vibrate
3. Volume turned up
4. Headphones connected (if required)

**Fix:**
- Toggle audio off/on
- Check device volume
- Reconnect to MARZ

---

## Technical Details

### Service Worker

Location: `/sw.js`

Features:
- Precaches app shell
- Runtime caching for API responses
- Offline fallback
- Push notification handling
- Background sync

### Manifest

Location: `/manifest.json`

Configuration:
- Name: "MARZ - Your Sovereign AI Partner"
- Start URL: `/marz/chat`
- Display: standalone
- Theme color: #06b6d4 (cyan)

### Voice Recognition

Uses Web Speech API:
- `SpeechRecognition` (Chrome/Edge)
- `webkitSpeechRecognition` (Safari)
- Continuous listening mode
- Interim results enabled

---

## Next Steps

### Generate Proper Icons

Replace placeholder icons with actual MARZ branding:

1. Create icons in these sizes:
   - 192x192 PNG (home screen)
   - 512x512 PNG (splash screen)
   - 96x96 PNG (shortcuts)

2. Place in `/public/icons/`:
   - `marz-icon-192.png`
   - `marz-icon-512.png`
   - `marz-wake-96.png`
   - `marz-video-96.png`

3. Update `manifest.json` if paths change

### Enable Push Notifications

1. Configure VAPID keys in environment:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key_here
   ```

2. Set up push notification backend

3. Test notification delivery

### Add App Screenshots

1. Capture screenshots of the app
2. Place in `/public/screenshots/`
3. Update `manifest.json` with screenshot paths

---

## Support

For issues or questions:
- Check browser console for errors
- Review service worker registration
- Verify HTTPS connection
- Test on latest Chrome/Edge

---

**MARZ PWA - Your Sovereign AI Partner, Always With You** 🚀
