import { PlainIndentFormatter } from "./formatters/plain-indent.js";
import { VSStackParser } from "./parsers/vs-parser.js";


window.addEventListener('DOMContentLoaded', () => {
    // Add on paste listener
    const pasteArea = document.getElementById('pastearea');
    pasteArea.addEventListener('paste', e => {
        const text = e.clipboardData.getData('text/plain');
        const funcMap = VSStackParser.parse(text);

        console.log(funcMap);

        // get the output element
        const output = document.getElementById('output');
        PlainIndentFormatter.format(funcMap, output);
    })
});