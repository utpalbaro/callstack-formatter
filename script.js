import { LIndentFormatter } from "./formatters/L-indent/L-indent.js";
import { PlainIndentFormatter } from "./formatters/plain-indent/plain-indent.js";
import { VSStackParser } from "./parsers/vs-parser/vs-parser.js";

async function copyToClipboardAsync(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Error copying text:', err);
    }
}

class FormatterMgr {
    static _instance = null;

    constructor() {
        this._formatters = {};
    }

    static getInstance() {
        if (!FormatterMgr._instance)
            FormatterMgr._instance = new FormatterMgr();

        return FormatterMgr._instance;
    }

    loadFormatters() {
        // First populate the internal data structure
        this._formatters['plain-indent'] = new PlainIndentFormatter();
        this._formatters['l-indent'] = new LIndentFormatter();

        // @TODO Temporary code starts
        const valueMap = {
            'plain-indent': 'Plain Indented',
            'l-indent': 'L-Indented'
        }
        // Temporary code ends

        // Now populate the options in html
        const formatterSelect = document.getElementById('formatter-select');
        for (let k in this._formatters) {
            const option = document.createElement('option');
            formatterSelect.appendChild(option);

            option.value = k;
            option.innerText = valueMap[k];
        }
    }

    /**
     * Returns an object of formatter type
     * @returns A formatter object
     */
    getSelectedFormatter() {
        // Get the item selected in html
        const formatterSelect = document.getElementById('formatter-select');
        const key = formatterSelect.value;
        return this._formatters[key];
    }
}

function clearOutput() {
    // If <pre> exists remove it
    const opchild = document.querySelector('.output > pre');
    if (opchild)
        opchild.remove();
}

/**
 * 
 * @param {string} text 
 * @returns 
 */
function parseCallStack(text) {
    if (text.trim() === '')
        return;

    const funcMap = VSStackParser.parse(text);

    if (!funcMap)
        return;

    // clear output first
    clearOutput();

    const output = document.getElementById('output');

    // Format it now
    const formatter = FormatterMgr.getInstance().getSelectedFormatter();
    formatter.format(funcMap, output);
}

window.addEventListener('DOMContentLoaded', () => {
    // Add on paste listener
    const pasteArea = document.getElementById('pastearea');
    pasteArea.addEventListener('paste', e => {
        const text = e.clipboardData.getData('text/plain');

        parseCallStack(text);

        // Copy the content to clipboard
        copyToClipboardAsync(output.innerText);
    });
    
    pasteArea.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            // A variable so that we can control the tabs or spaces if needed later
            let tabChar = '    ';
            
            const caretPosition = pasteArea.selectionStart;
            const newCaretPosition = caretPosition + tabChar.length;
            pasteArea.value = pasteArea.value.substring(0, caretPosition) + tabChar + pasteArea.value.substring(caretPosition, pasteArea.value.length);
            pasteArea.selectionStart = newCaretPosition;
        }
    });

    // Populate HTML formatters
    const formatterMgr = FormatterMgr.getInstance();
    formatterMgr.loadFormatters();

    // Add onselectionchange listener to the select element
    const formatterSelect = document.getElementById('formatter-select');
    formatterSelect.addEventListener('change', e => {
        console.log(e.target.value);

        // Format (if there's something on the paste area) when selection changes
        const text = pasteArea.value;

        parseCallStack(text);
    });
});