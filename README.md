# Jelly’s Sock Sprint

A tiny, single-screen apartment game about a very fast Danish-Swedish Farmdog.

## Start playing

Double-click `index.html` to open it in a modern browser (Chrome, Edge, Firefox,
or Safari). No installation, server, internet connection, or build step is needed.
From VS Code, reveal `index.html` in Finder / File Explorer, then open it with
your browser. Keep `index.html`, `style.css`, `game.js`, and the `Jelly` folder
together.

On an iPhone, open `index.html` in Safari after copying the game folder to the
device or hosting these same files as a static site. Use the on-screen paw pad;
keyboard controls remain available on desktop.

## How to play

- Click **Let’s sprint**, then use **WASD**, the **arrow keys**, or the on-screen
  paw pad on touch devices to move.
- Collect coloured socks for **10 points each**.
- Avoid brown, jagged mystery snacks marked **?**. Each costs **one heart** and
  gives a **two-second speed boost**, followed by normal speed. After a hit,
  Jelly has 1.4 seconds of protection against further damage.
- You start with **three hearts**. Losing all three ends the round early.
- At **45 seconds elapsed** (15 seconds remaining), a green sofa appears in the
  bottom-right corner. Touch it for a **one-time 100-point cuddle bonus**.
  You can keep collecting socks afterward.
- A full round lasts **60 seconds of active play**. The final scene celebrates
  the cuddle if you reached the sofa and shows a score breakdown.
- Press **Escape** to pause or resume. Switching windows or tabs pauses the game.
- Click **↻** in the HUD or **One more sprint** at the end to start a fresh round.

The game supports touch devices as well as keyboards. A landscape phone view gives
the apartment the most room, though portrait view also works. There is no online
competition or leaderboard. Collectibles respawn in clear floor space, away from
Jelly, furniture, and the sofa corner.

## Local artwork

The title screen, HUD, and results use the original local photo directly:
`Jelly/D7F0AA97-CB4D-4150-AD15-686F16528EA9_1_105_c.jpeg`.
The image is used directly as a local repository asset and is not edited or used
as an animated sprite.

Jelly’s separate SVG character takes its mostly white body, dark cap, folded
ears, tan facial markings, white blaze and muzzle, and black nose from that
photo. The room and objects are also inline SVG. All fonts are system fonts;
there are no libraries, external assets, APIs, or network requests.

## Files

- `index.html`: layout, portraits, apartment, and Jelly SVG
- `style.css`: styling, responsive layout, and small character animations
- `mobile.css`: iPhone layout and touch paw pad
- `game.js`: movement, collisions, timer, scoring, and game states

To adjust difficulty, the movement speeds, snack boost, and collision distances
are defined in `game.js` inside `update()`.
