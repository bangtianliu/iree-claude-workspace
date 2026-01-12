// Review Comment Highlighting Module
// Highlights RVW and RVWY review comments with color-coded backgrounds
//
// Supported formats:
//   Single-line: // RVW: comment text
//   Multi-line:  // RVW: first line
//                // *    continuation line
//                // *
//                // *    blank continuation lines stay in block

const vscode = require('vscode');

// Decoration types (initialized on activate)
let rvwDecorationType = null;
let rvwyDecorationType = null;

// Regex patterns for comment detection
// Matches: optional whitespace, comment prefix (// or #), RVW:/RVWY:
const RVW_START_PATTERN = /^(\s*)(\/\/|#)\s*RVW:/;
const RVWY_START_PATTERN = /^(\s*)(\/\/|#)\s*RVWY:/;

// Continuation pattern: same prefix followed by * and either whitespace or end of line
const CONTINUATION_PATTERN = /^(\s*)(\/\/|#)\s*\*(\s|$)/;

/**
 * Find all review comment ranges in a document
 * @param {vscode.TextDocument} document
 * @returns {{ rvwRanges: vscode.Range[], rvwyRanges: vscode.Range[] }}
 */
function findReviewCommentRanges(document) {
    const rvwRanges = [];
    const rvwyRanges = [];

    let inRvwBlock = false;
    let inRvwyBlock = false;
    let blockIndent = '';
    let blockCommentPrefix = '';

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;

        // Check for RVW start
        const rvwMatch = text.match(RVW_START_PATTERN);
        if (rvwMatch) {
            rvwRanges.push(line.range);
            inRvwBlock = true;
            inRvwyBlock = false;
            blockIndent = rvwMatch[1];
            blockCommentPrefix = rvwMatch[2];
            continue;
        }

        // Check for RVWY start
        const rvwyMatch = text.match(RVWY_START_PATTERN);
        if (rvwyMatch) {
            rvwyRanges.push(line.range);
            inRvwyBlock = true;
            inRvwBlock = false;
            blockIndent = rvwyMatch[1];
            blockCommentPrefix = rvwyMatch[2];
            continue;
        }

        // Check for continuation if we're in a block
        if (inRvwBlock || inRvwyBlock) {
            const contMatch = text.match(CONTINUATION_PATTERN);
            if (contMatch &&
                contMatch[1] === blockIndent &&
                contMatch[2] === blockCommentPrefix) {
                // Valid continuation line
                if (inRvwBlock) {
                    rvwRanges.push(line.range);
                } else {
                    rvwyRanges.push(line.range);
                }
            } else {
                // Not a valid continuation - end the block
                inRvwBlock = false;
                inRvwyBlock = false;
                blockIndent = '';
                blockCommentPrefix = '';
            }
        }
    }

    return { rvwRanges, rvwyRanges };
}

/**
 * Update decorations for the given editor
 * @param {vscode.TextEditor} editor
 */
function updateDecorations(editor) {
    if (!editor || !rvwDecorationType || !rvwyDecorationType) {
        return;
    }

    const { rvwRanges, rvwyRanges } = findReviewCommentRanges(editor.document);

    editor.setDecorations(rvwDecorationType, rvwRanges);
    editor.setDecorations(rvwyDecorationType, rvwyRanges);
}

/**
 * Activate the review highlighting feature
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Create decoration types
    rvwDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 235, 59, 0.3)',  // Yellow
        isWholeLine: true,
        overviewRulerColor: 'rgba(255, 235, 59, 0.8)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    rvwyDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(144, 202, 249, 0.3)',  // Light blue
        isWholeLine: true,
        overviewRulerColor: 'rgba(144, 202, 249, 0.8)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    // Update decorations when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDecorations(editor);
            }
        })
    );

    // Update decorations when document text changes (debounced)
    let updateTimeout = null;
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                if (updateTimeout) {
                    clearTimeout(updateTimeout);
                }
                updateTimeout = setTimeout(() => {
                    updateDecorations(editor);
                    updateTimeout = null;
                }, 100);
            }
        })
    );

    // Update decorations when a document is opened
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                updateDecorations(editor);
            }
        })
    );

    // Initial decoration for current editor
    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    // Also update all visible editors
    vscode.window.visibleTextEditors.forEach(editor => {
        updateDecorations(editor);
    });
}

/**
 * Deactivate and clean up
 */
function deactivate() {
    if (rvwDecorationType) {
        rvwDecorationType.dispose();
        rvwDecorationType = null;
    }
    if (rvwyDecorationType) {
        rvwyDecorationType.dispose();
        rvwyDecorationType = null;
    }
}

module.exports = {
    activate,
    deactivate,
    updateDecorations,
    findReviewCommentRanges
};
