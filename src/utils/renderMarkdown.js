function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function inlineFormat(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    const html = [];

    let inCodeBlock = false;
    let inUnorderedList = false;
    let inOrderedList = false;

    const closeLists = () => {
        if (inUnorderedList) {
            html.push('</ul>');
            inUnorderedList = false;
        }

        if (inOrderedList) {
            html.push('</ol>');
            inOrderedList = false;
        }
    };

    for (const line of lines) {
        if (line.trim().startsWith('```')) {
            closeLists();

            if (!inCodeBlock) {
                html.push('<pre><code>');
                inCodeBlock = true;
            } else {
                html.push('</code></pre>');
                inCodeBlock = false;
            }

            continue;
        }

        if (inCodeBlock) {
            html.push(`${escapeHtml(line)}\n`);
            continue;
        }

        if (!line.trim()) {
            closeLists();
            html.push('<br>');
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            closeLists();
            const level = heading[1].length;
            html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
            continue;
        }

        const orderedItem = line.match(/^\d+\.\s+(.+)$/);
        if (orderedItem) {
            if (!inOrderedList) {
                closeLists();
                html.push('<ol>');
                inOrderedList = true;
            }
            html.push(`<li>${inlineFormat(orderedItem[1])}</li>`);
            continue;
        }

        const unorderedItem = line.match(/^[-*]\s+(.+)$/);
        if (unorderedItem) {
            if (!inUnorderedList) {
                closeLists();
                html.push('<ul>');
                inUnorderedList = true;
            }
            html.push(`<li>${inlineFormat(unorderedItem[1])}</li>`);
            continue;
        }

        closeLists();
        html.push(`<p>${inlineFormat(line)}</p>`);
    }

    if (inCodeBlock) {
        html.push('</code></pre>');
    }

    closeLists();

    return html.join('\n');
}

module.exports = {
    renderMarkdownToHtml
};
