import { LIndentFormatter } from "./formatters/L-indent.js";
import { PlainIndentFormatter } from "./formatters/plain-indent.js";
import { VSStackParser } from "./parsers/vs-parser.js";

async function copyToClipboardAsync(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Error copying text:', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
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
        LIndentFormatter.format(funcMap, output);

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