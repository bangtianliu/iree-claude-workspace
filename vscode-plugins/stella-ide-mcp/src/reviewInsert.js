// Review Comment Insertion Module
// Inserts formatted RVW/RVWY comments above the cursor position
//
// Output formats:
//   Single-line: // RVW: comment text
//   Multi-line:  // RVW: first line
//                // *    continuation lines aligned

const vscode = require('vscode');

// Language ID to comment prefix mapping
const COMMENT_PREFIXES = {
    // C-style languages
    'c': '//',
    'cpp': '//',
    'csharp': '//',
    'java': '//',
    'javascript': '//',
    'typescript': '//',
    'javascriptreact': '//',
    'typescriptreact': '//',
    'rust': '//',
    'go': '//',
    'swift': '//',
    'kotlin': '//',
    'scala': '//',
    'objective-c': '//',
    'objective-cpp': '//',
    // MLIR/LLVM
    'mlir': '//',
    'llvm': ';',
    'tablegen': '//',
    // Script languages with # comments
    'python': '#',
    'ruby': '#',
    'perl': '#',
    'shellscript': '#',
    'bash': '#',
    'zsh': '#',
    'fish': '#',
    'yaml': '#',
    'toml': '#',
    'dockerfile': '#',
    'makefile': '#',
    'cmake': '#',
    'r': '#',
    'julia': '#',
    'coffeescript': '#',
};

/**
 * Get the comment prefix for a language
 * @param {string} languageId - VSCode language identifier
 * @returns {string} Comment prefix (default '//')
 */
function getCommentPrefix(languageId) {
    return COMMENT_PREFIXES[languageId] || '//';
}

/**
 * Format a review comment with proper multi-line continuation
 *
 * Single-line output:
 *   // RVW: comment text
 *
 * Multi-line output (text split by newlines):
 *   // RVW: First line of the comment
 *   // *    Second line aligned with first
 *   // *    Third line continues
 *
 * @param {string} text - The comment text (may contain newlines)
 * @param {'RVW'|'RVWY'} type - Comment type
 * @param {string} prefix - Comment prefix ('// ' or '# ')
 * @param {string} indent - Whitespace indentation to prepend
 * @returns {string} Formatted comment lines joined with newlines
 */
function formatReviewComment(text, type, prefix, indent) {
    const lines = text.split('\n');
    const marker = `${type}: `;

    // Calculate continuation alignment
    // First line: "// RVW: text"
    // Continuation: "// *    text" where spaces align text with first line
    // marker.length gives us the right number of spaces after "* "
    const continuationSpaces = ' '.repeat(marker.length);

    const result = [];
    for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        if (i === 0) {
            // First line: {indent}{prefix} {type}: {text}
            result.push(`${indent}${prefix} ${marker}${lineText}`);
        } else {
            // Continuation: {indent}{prefix} *{spaces}{text}
            result.push(`${indent}${prefix} *${continuationSpaces}${lineText}`);
        }
    }

    return result.join('\n');
}

/**
 * Insert a review comment above the current cursor position
 *
 * @param {string} text - Comment text (may contain newlines for multi-line)
 * @param {'RVW'|'RVWY'} type - Comment type
 * @returns {Promise<{success: boolean, error?: string}>} Result
 */
async function insertReviewComment(text, type) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return { success: false, error: 'No active editor' };
    }

    if (!text || text.trim() === '') {
        return { success: false, error: 'Comment text is empty' };
    }

    if (type !== 'RVW' && type !== 'RVWY') {
        return { success: false, error: 'Invalid comment type (must be RVW or RVWY)' };
    }

    const document = editor.document;
    const position = editor.selection.active;
    const currentLine = document.lineAt(position.line);

    // Get indentation from current line
    const indentMatch = currentLine.text.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    // Get comment prefix for this language
    const prefix = getCommentPrefix(document.languageId);

    // Format the comment
    const formattedComment = formatReviewComment(text.trim(), type, prefix, indent);

    // Insert at the beginning of the current line (pushes current line down)
    const insertPosition = new vscode.Position(position.line, 0);

    const success = await editor.edit(editBuilder => {
        editBuilder.insert(insertPosition, formattedComment + '\n');
    });

    if (success) {
        // Move cursor to end of inserted comment (optional, could stay on original line)
        // For now, we leave the cursor where it was (now on the line below the comment)
        return { success: true };
    } else {
        return { success: false, error: 'Edit failed' };
    }
}

/**
 * Prompt user for text and insert RVW comment
 * (Used for command palette integration)
 */
async function promptAndInsertRvw() {
    const text = await vscode.window.showInputBox({
        prompt: 'Enter RVW comment (discuss with reviewer)',
        placeHolder: 'Review comment text...',
        ignoreFocusOut: true
    });

    if (text) {
        const result = await insertReviewComment(text, 'RVW');
        if (!result.success) {
            vscode.window.showWarningMessage(`Failed to insert RVW: ${result.error}`);
        }
    }
}

/**
 * Prompt user for text and insert RVWY comment
 * (Used for command palette integration)
 */
async function promptAndInsertRvwy() {
    const text = await vscode.window.showInputBox({
        prompt: 'Enter RVWY comment (YOLO - fix without asking)',
        placeHolder: 'YOLO fix comment text...',
        ignoreFocusOut: true
    });

    if (text) {
        const result = await insertReviewComment(text, 'RVWY');
        if (!result.success) {
            vscode.window.showWarningMessage(`Failed to insert RVWY: ${result.error}`);
        }
    }
}

module.exports = {
    insertReviewComment,
    formatReviewComment,
    getCommentPrefix,
    promptAndInsertRvw,
    promptAndInsertRvwy
};
