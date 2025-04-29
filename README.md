# Matrix Snake Login

A Python desktop app with an animated matrix-style login screen and encrypted user authentication using Fernet. Successfully logging in launches a classic Snake game with user-based score tracking.

## Features

- Matrix-themed GUI with animated login
- Encrypted credential storage using `cryptography.Fernet`
- Snake game (ends only on wall collision)
- Username-based score tracking with leaderboard
- Admin panel to register users

## How to Run

```bash
pip install cryptography
python main.py
