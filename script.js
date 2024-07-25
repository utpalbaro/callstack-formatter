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
    constructor() {
        this._formatters = {};
    }

    loadFormatters() {
        // First populate the internal data structure
        this._formatters['plain-indent'] = new PlainIndentFormatter();
        this._formatters['l-indent'] = new LIndentFormatter();

        // Temporary code starts
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

window.addEventListener('DOMContentLoaded', () => {
    // Populate HTML formatters
    const formatterMgr = new FormatterMgr();
    formatterMgr.loadFormatters();

    // Add on paste listener
    const pasteArea = document.getElementById('pastearea');
    pasteArea.addEventListener('paste', e => {
        const text = e.clipboardData.getData('text/plain');
        const funcMap = VSStackParser.parse(text);

        if (!funcMap)
            return;

        console.log(funcMap);

        // get the output element
        const output = document.getElementById('output');
        const formatter = formatterMgr.getSelectedFormatter();
        formatter.format(funcMap, output);

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
});