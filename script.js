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

class ParserMgr {
    static _instance = null;

    constructor() {
        this._parsers = {};
    }

    /**
     * 
     * @returns {ParserMgr}
     */
    static getInstance() {
        if (!ParserMgr._instance)
            ParserMgr._instance = new ParserMgr();

        return ParserMgr._instance;
    }

    loadParsers() {
        this._parsers['vs-c++'] = new VSStackParser();

        // @TODO Temporary code starts
        const valueMap = {
            'vs-c++': 'Visual Studio C++'
        }
        // Temporary code ends

        const parserSelect = document.getElementById('parser-select');
        for (let k in this._parsers) {
            const option = document.createElement('option');
            parserSelect.appendChild(option);

            option.value = k;
            option.innerText = valueMap[k];
        }
    }

    /**
     * Returns an object of parser type
     * @returns A formatter object
     */
    getSelectedParser() {
        // Get the item selected in html
        const parserSelect = document.getElementById('parser-select');
        console.log(this._parsers);
        const key = parserSelect.value;
        return this._parsers[key];
    }
}

class FormatterMgr {
    static _instance = null;

    constructor() {
        this._formatters = {};
    }

    /**
     * 
     * @returns {ParserMgr}
     */
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
        const parserSelect = document.getElementById('formatter-select');
        for (let k in this._formatters) {
            const option = document.createElement('option');
            parserSelect.appendChild(option);

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
        const parserSelect = document.getElementById('formatter-select');
        const key = parserSelect.value;
        return this._formatters[key];
    }
}

function clearOutput() {
    // If <pre> exists remove it
    const opchild = document.querySelector('.output > pre');
    if (opchild)
        opchild.remove();
}

function clearInput() {
    document.getElementById('pastearea').value = '';
}

/**
 * 
 * @param {string} text 
 * @returns 
 */
function parseCallStack(text) {
    if (text.trim() === '')
        return;

    const parser = ParserMgr.getInstance().getSelectedParser();
    const funcMap = parser.parse(text);

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

        // Check if autocopy button is enabled
        const autocopy = document.getElementById('output-autocopy').classList.contains('enabled');
        if (!autocopy)
            return;

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

    const parserMgr = ParserMgr.getInstance();
    parserMgr.loadParsers(); 

    // Add onselectionchange listener to the select element
    const parserSelect = document.getElementById('formatter-select');
    parserSelect.addEventListener('change', e => {
        console.log(e.target.value);

        // Format (if there's something on the paste area) when selection changes
        const text = pasteArea.value;

        parseCallStack(text);
    });

    // Add toggle class to all toggle type buttons
    const toggleBtns = document.querySelectorAll('button.toggle-btn');
    for (let i = 0; i < toggleBtns.length; ++i) {
        toggleBtns[i].addEventListener('click', e => {
            e.target.classList.toggle('enabled');
        });
    }

    document.getElementById('output-clear').addEventListener('click', e => {
        clearOutput();
    })

    document.getElementById('input-clear').addEventListener('click', e => {
        clearInput();
    })
});