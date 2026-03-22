const path = require('path');
const fs = require('fs/promises');
const router = require('express').Router();
const { renderMarkdownToHtml } = require('../utils/renderMarkdown');

const README_PATH = path.resolve(__dirname, '../../README.md');

router.get('/', async (req, res, next) => {
    try {
        const markdown = await fs.readFile(README_PATH, 'utf8');
        const htmlBody = renderMarkdownToHtml(markdown);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Documentation</title>
    <style>
        :root {
            --bg: #f6f7fb;
            --card: #ffffff;
            --text: #1d2433;
            --muted: #5c6a80;
            --accent: #1d5fd1;
            --border: #e6e9f0;
            --codeBg: #0f172a;
            --codeText: #e2e8f0;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            background: linear-gradient(160deg, #eef2ff 0%, #f8fafc 50%, #fff7ed 100%);
            color: var(--text);
            font-family: Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
        }

        .container {
            max-width: 980px;
            margin: 24px auto;
            padding: 0 16px;
        }

        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 14px;
            box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
            padding: 28px;
        }

        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 14px;
        }

        .title {
            margin: 0;
            font-size: 1.35rem;
            font-weight: 700;
        }

        .meta {
            margin: 0;
            color: var(--muted);
            font-size: 0.95rem;
        }

        h1, h2, h3, h4, h5, h6 {
            margin: 1.2em 0 0.5em;
            line-height: 1.25;
        }

        p { margin: 0.65em 0; }

        ul, ol { margin: 0.5em 0 0.8em 1.2em; }

        code {
            font-family: Consolas, Menlo, Monaco, monospace;
            background: #eef2ff;
            border: 1px solid #dbe3ff;
            border-radius: 6px;
            padding: 0.1em 0.35em;
            font-size: 0.9em;
        }

        pre {
            margin: 0.8em 0;
            padding: 14px;
            border-radius: 10px;
            overflow: auto;
            background: var(--codeBg);
            border: 1px solid #22314d;
        }

        pre code {
            background: transparent;
            border: none;
            padding: 0;
            color: var(--codeText);
            white-space: pre;
        }

        br { display: block; margin: 0.25em 0; }
    </style>
</head>
<body>
    <main class="container">
        <section class="card">
            <header class="topbar">
                <div>
                    <h1 class="title">API Documentation</h1>
                    <p class="meta">Rendered from README.md at runtime</p>
                </div>
            </header>
            ${htmlBody}
        </section>
    </main>
</body>
</html>`);
    } catch (error) {
        next(error);
    }
});

router.get('/raw', async (req, res, next) => {
    try {
        const markdown = await fs.readFile(README_PATH, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(markdown);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
