# Let's Cook: tablet cooking companion

A working, tablet-landscape website built from the Figma design. Follow a recipe
hands-free with **voice commands** and **hand gestures**.

## Run it

```
python serve.py
```

Then open **http://localhost:5173** in **Chrome or Edge**, and allow camera and microphone when asked.

## Try the cook-along

Home → *Let's cook!* (or the Eggless Vanilla Sponge Cake) → *Let's get cooking* → ingredient check →
choose gestures and/or voice → quick test → preparation (3 tasks) → 7 cooking steps → *You made it!*

| Gesture (camera) | Default action | Voice (say) |
|---|---|---|
| Thumbs up | Next step | "Next", "Done", "Aage" |
| Closed fist | Pause | "Pause", "Ruko" |
| Open hand | Resume | "Resume", "Continue" |
| One finger up | Repeat step | "Repeat", "Phir se" |
| Two fingers (V) | Ask for help | "Help me" |
| OK sign | Start timer | "Start timer" |

Also by voice: "Previous", "Skip ahead", "Ingredients", "Stop timer", "Exit cooking",
"I'm ready to cook". Hold a gesture for about a second. If a command isn't understood,
the companion asks again; there are no on-screen fallback buttons while cooking.

Change any gesture's action, add your own phrases, pick English / हिन्दी / Hinglish,
hand, hold time, sensitivity and reading speed in **Profile & settings** (the "A" avatar).
Settings are saved in this browser.

Keyboard shortcuts for testing on a laptop (cook screens): → next, ← previous,
Space pause/resume, R repeat, H help, T timer, I ingredients, Esc exit.

## Testing on a real tablet

Camera and microphone only work on `localhost` or HTTPS. Easiest options:

- **Android tablet:** connect by USB, open `chrome://inspect` on the laptop, enable
  *Port forwarding* for `5173 → localhost:5173`, then open `http://localhost:5173` on the tablet.
- **Any tablet:** expose the server through an HTTPS tunnel (for example `cloudflared` or `ngrok`).

Voice recognition uses the browser's speech service (Chrome/Edge, and Safari on iPad),
so it needs an internet connection. Gesture recognition uses Google MediaPipe, loaded from a CDN.

## Files

- `index.html`, `styles.css`: page shell and design tokens (white, light grey, pastel green/orange)
- `app.js`: pages, routing and the cook-along flow
- `controls.js`: voice (Web Speech API) and gesture (MediaPipe GestureRecognizer) engines
- `data.js`: recipes, cake steps, default commands and companion lines
- `assets/`: logo, dish photos (Unsplash), gesture photos, step illustrations
