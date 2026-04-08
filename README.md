# Experiment 7 - Gaussian Elimination Solver

This repository now contains a browser-openable HTML/CSS/JavaScript page focused only on experiment 7.

## Current Status

- Single HTML entry point in `index.html`
- One dedicated page for Gaussian elimination with partial pivoting
- Part A: fixed homework example from experiment 7
- Part B: general solver for custom square systems
- Styling and responsive layout in `css/style.css`

## Project Structure

```text
.
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js
    └── experiments/
        └── gaussian.js
```

## Run

Open `index.html` directly in a browser. The current page is static and works offline on Windows and Linux as long as JavaScript is enabled.

If you prefer serving the project locally, run a minimal static server in the project directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## What the Page Provides

- Homework example solver for
  - `A = [[1, 1, 3], [2, 4, 5], [3, 5, 6]]`
  - `b = [1, 2, 3]`
- General solver for any square matrix and matching right-hand side vector
- Step-by-step elimination log
- Final solution vector table
