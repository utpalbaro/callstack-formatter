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
        PlainIndentFormatter.format(funcMap, output);

        // Copy the content to clipboard
        copyToClipboardAsync(output.innerText);
    })
});