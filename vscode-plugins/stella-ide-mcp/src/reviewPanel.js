// Review Panel WebView Provider
// ==============================
// Provides a bottom panel UI for entering review comments.
//
// Features:
// - Multi-line text area for comment input
// - RVW/RVWY type selector buttons
// - Submit button with Ctrl+Enter shortcut
// - Clears input after successful insertion
// - Extensive debug logging for troubleshooting
//
// Node.js 12 compatible (no class fields, no ??, no optional chaining)

'use strict';

var vscode = require('vscode');
var reviewInsert = require('./reviewInsert');

// View type ID - MUST match the "id" in package.json views contribution
var VIEW_TYPE = 'stella-review-panel';

// Module-level logger (set during activate)
var _log = function(msg) { console.log('[ReviewPanel] ' + msg); };

/**
 * Set the logger function (called from extension.js)
 */
function setLogger(logFn) {
    _log = function(msg) {
        logFn('[ReviewPanel] ' + msg);
    };
}

/**
 * ReviewPanelProvider constructor
 * Implements vscode.WebviewViewProvider interface
 */
function ReviewPanelProvider(extensionUri) {
    _log('Constructor called with extensionUri: ' + extensionUri);
    this._extensionUri = extensionUri;
    this._view = null;
}

// Expose viewType as static property
ReviewPanelProvider.viewType = VIEW_TYPE;

/**
 * resolveWebviewView - Called by VSCode when the view needs to be rendered
 * This is the key method that VSCode calls to initialize the webview.
 *
 * @param {vscode.WebviewView} webviewView - The webview view instance
 * @param {vscode.WebviewViewResolveContext} context - Context about how the view was resolved
 * @param {vscode.CancellationToken} token - Cancellation token
 */
ReviewPanelProvider.prototype.resolveWebviewView = function(webviewView, context, token) {
    _log('resolveWebviewView called!');
    _log('  webviewView.viewType: ' + webviewView.viewType);
    _log('  context.state: ' + JSON.stringify(context.state));

    var self = this;
    this._view = webviewView;

    // Configure webview options
    webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this._extensionUri]
    };
    _log('  Webview options configured');

    // Set the HTML content
    webviewView.webview.html = this._getHtmlContent();
    _log('  HTML content set');

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(function(message) {
        _log('Received message from webview: ' + JSON.stringify(message));

        if (message.command === 'insert') {
            _log('  Processing insert command: type=' + message.type + ', text=' + message.text.substring(0, 50) + '...');

            reviewInsert.insertReviewComment(message.text, message.type)
                .then(function(result) {
                    _log('  Insert result: ' + JSON.stringify(result));
                    if (result.success) {
                        // Clear the input after successful insert
                        if (self._view) {
                            self._view.webview.postMessage({ command: 'clear' });
                        }
                        // Focus back to the editor
                        vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
                    } else {
                        vscode.window.showWarningMessage(
                            'Failed to insert comment: ' + (result.error || 'Unknown error')
                        );
                    }
                })
                .catch(function(err) {
                    _log('  Insert error: ' + err.message);
                    vscode.window.showErrorMessage('Error inserting comment: ' + err.message);
                });
        } else if (message.command === 'focus-editor') {
            _log('  Focusing editor');
            vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
        } else if (message.command === 'log') {
            _log('  [Webview] ' + message.text);
        }
    });
    _log('  Message handler registered');

    // Handle view becoming visible/hidden
    webviewView.onDidChangeVisibility(function() {
        _log('View visibility changed: visible=' + webviewView.visible);
    });

    // Handle view disposal
    webviewView.onDidDispose(function() {
        _log('View disposed');
        self._view = null;
    });

    _log('resolveWebviewView completed successfully');
};

/**
 * Focus the panel (show it if hidden)
 */
ReviewPanelProvider.prototype.focus = function() {
    _log('focus() called');
    if (this._view) {
        this._view.show(true);
        _log('  View shown');
    } else {
        _log('  No view to show');
    }
};

/**
 * Generate the HTML content for the webview
 * Uses string concatenation for Node.js 12 compatibility
 */
ReviewPanelProvider.prototype._getHtmlContent = function() {
    _log('_getHtmlContent called');

    var html = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '    <meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\';">',
        '    <title>Review Comment</title>',
        '    <style>',
        '        * { box-sizing: border-box; margin: 0; padding: 0; }',
        '        body {',
        '            padding: 8px;',
        '            font-family: var(--vscode-font-family);',
        '            font-size: var(--vscode-font-size);',
        '            color: var(--vscode-foreground);',
        '            background-color: var(--vscode-panel-background);',
        '        }',
        '        .container { display: flex; flex-direction: column; gap: 8px; height: 100%; }',
        '        textarea {',
        '            flex: 1;',
        '            min-height: 60px;',
        '            max-height: 200px;',
        '            resize: vertical;',
        '            padding: 8px;',
        '            border: 1px solid var(--vscode-input-border);',
        '            border-radius: 4px;',
        '            background-color: var(--vscode-input-background);',
        '            color: var(--vscode-input-foreground);',
        '            font-family: var(--vscode-editor-font-family);',
        '            font-size: var(--vscode-editor-font-size);',
        '            line-height: 1.4;',
        '        }',
        '        textarea:focus {',
        '            outline: 1px solid var(--vscode-focusBorder);',
        '            border-color: var(--vscode-focusBorder);',
        '        }',
        '        textarea::placeholder { color: var(--vscode-input-placeholderForeground); }',
        '        .controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }',
        '        .type-buttons { display: flex; gap: 4px; }',
        '        .type-btn {',
        '            padding: 6px 12px;',
        '            border: 1px solid transparent;',
        '            border-radius: 4px;',
        '            cursor: pointer;',
        '            font-size: 12px;',
        '            font-weight: 500;',
        '        }',
        '        .type-btn.rvw {',
        '            background-color: rgba(255, 235, 59, 0.2);',
        '            color: var(--vscode-foreground);',
        '            border-color: rgba(255, 235, 59, 0.5);',
        '        }',
        '        .type-btn.rvw:hover, .type-btn.rvw.selected {',
        '            background-color: rgba(255, 235, 59, 0.4);',
        '            border-color: rgba(255, 235, 59, 0.8);',
        '        }',
        '        .type-btn.rvwy {',
        '            background-color: rgba(144, 202, 249, 0.2);',
        '            color: var(--vscode-foreground);',
        '            border-color: rgba(144, 202, 249, 0.5);',
        '        }',
        '        .type-btn.rvwy:hover, .type-btn.rvwy.selected {',
        '            background-color: rgba(144, 202, 249, 0.4);',
        '            border-color: rgba(144, 202, 249, 0.8);',
        '        }',
        '        .submit-btn {',
        '            padding: 6px 16px;',
        '            background-color: var(--vscode-button-background);',
        '            color: var(--vscode-button-foreground);',
        '            border: none;',
        '            border-radius: 4px;',
        '            cursor: pointer;',
        '            font-size: 12px;',
        '            font-weight: 500;',
        '        }',
        '        .submit-btn:hover { background-color: var(--vscode-button-hoverBackground); }',
        '        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }',
        '        .hint { margin-left: auto; font-size: 11px; color: var(--vscode-descriptionForeground); }',
        '        .type-label { font-size: 11px; color: var(--vscode-descriptionForeground); margin-right: 4px; }',
        '    </style>',
        '</head>',
        '<body>',
        '    <div class="container">',
        '        <textarea id="comment" placeholder="Enter review comment... (Ctrl+Enter to submit)" rows="3"></textarea>',
        '        <div class="controls">',
        '            <span class="type-label">Type:</span>',
        '            <div class="type-buttons">',
        '                <button class="type-btn rvw selected" data-type="RVW" title="RVW: Discuss before fixing">RVW</button>',
        '                <button class="type-btn rvwy" data-type="RVWY" title="RVWY: YOLO fix">RVWY</button>',
        '            </div>',
        '            <button class="submit-btn" id="submit" disabled>Insert</button>',
        '            <span class="hint">Ctrl+Enter</span>',
        '        </div>',
        '    </div>',
        '    <script>',
        '        (function() {',
        '            var vscode = acquireVsCodeApi();',
        '            function log(msg) { vscode.postMessage({ command: "log", text: msg }); }',
        '            log("Webview script starting");',
        '',
        '            var textarea = document.getElementById("comment");',
        '            var submitBtn = document.getElementById("submit");',
        '            var typeButtons = document.querySelectorAll(".type-btn");',
        '            var selectedType = "RVW";',
        '',
        '            function updateSubmitState() {',
        '                submitBtn.disabled = textarea.value.trim() === "";',
        '            }',
        '',
        '            typeButtons.forEach(function(btn) {',
        '                btn.addEventListener("click", function() {',
        '                    typeButtons.forEach(function(b) { b.classList.remove("selected"); });',
        '                    btn.classList.add("selected");',
        '                    selectedType = btn.dataset.type;',
        '                    log("Type selected: " + selectedType);',
        '                    textarea.focus();',
        '                });',
        '            });',
        '',
        '            textarea.addEventListener("input", updateSubmitState);',
        '',
        '            function submit() {',
        '                var text = textarea.value.trim();',
        '                if (!text) return;',
        '                log("Submitting: type=" + selectedType + ", text=" + text.substring(0, 30));',
        '                vscode.postMessage({ command: "insert", text: text, type: selectedType });',
        '            }',
        '',
        '            submitBtn.addEventListener("click", submit);',
        '',
        '            textarea.addEventListener("keydown", function(e) {',
        '                if (e.ctrlKey && e.key === "Enter") {',
        '                    e.preventDefault();',
        '                    submit();',
        '                }',
        '                if (e.key === "Escape") {',
        '                    textarea.value = "";',
        '                    updateSubmitState();',
        '                    vscode.postMessage({ command: "focus-editor" });',
        '                }',
        '            });',
        '',
        '            window.addEventListener("message", function(event) {',
        '                var message = event.data;',
        '                log("Received message: " + JSON.stringify(message));',
        '                if (message.command === "clear") {',
        '                    textarea.value = "";',
        '                    updateSubmitState();',
        '                }',
        '            });',
        '',
        '            updateSubmitState();',
        '            log("Webview script initialized");',
        '        })();',
        '    </script>',
        '</body>',
        '</html>'
    ].join('\n');

    return html;
};

// Export
module.exports = {
    ReviewPanelProvider: ReviewPanelProvider,
    setLogger: setLogger,
    VIEW_TYPE: VIEW_TYPE
};
