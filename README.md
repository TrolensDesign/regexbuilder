# Regex Builder

A simple **cookie-builder-style regex builder** that lets you assemble regular expressions from blocks, preview the result, and test it live.

## How to run

### Option 1: open directly

Open `index.html` in your browser.

### Option 2: run a local HTTP server (recommended)

From the repo root run:

```bash
python -m http.server 4173
```

Then open:

- http://localhost:4173

## How to test

### Quick manual test in the UI

1. Start the server:
   ```bash
   python -m http.server 4173
   ```
2. Open http://localhost:4173
3. Try this example:
   - Click **Start (^)**
   - Click **Word character (\\w)** and set quantifier to **1 or more (+)**
   - Click **Digit (\\d)** and set quantifier to **between 2 and 5 ({2,5})**
   - Click **End ($)**
   - In the tester, paste: `user12 user12345 test99`

### Programmatic checks

Validate JavaScript syntax:

```bash
node --check app.js
```

## What the flags mean (`i`, `m`, `s`, `g`)

- `i` (**ignore case**): letters are matched case-insensitively (`cat` also matches `Cat`).
- `m` (**multiline**): `^` and `$` work for each line, not only start/end of full text.
- `s` (**dotall**): `.` can also match newline characters (`\n`).
- `g` (**global**): find all matches instead of stopping at the first one.

Tip: If you're unsure, start with only `g` enabled and add others only when needed.

## Beginner usage guide

1. Add blocks from left to right to describe the pattern.
2. Set quantifiers in **Your blocks** (`+`, `*`, `?`, `{2,5}`, etc.).
3. Enable flags in the **Preview** section if your case needs them.
4. Paste sample text into **Tester** and check how many matches you get.
5. Click **Copy regex** when result looks correct.

## Features

- ready-made blocks (`\\d`, `\\w`, `\\s`, `^`, `$`, `|`, `.`),
- custom blocks: literal, character class, and named group,
- per-block quantifiers,
- reordering blocks,
- regex preview with flags,
- live match tester.
