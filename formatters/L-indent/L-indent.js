export class LIndentFormatter {
    /**
     * 
     * @param {Object} options 
     */
    constructor(options) {
        this.options = {
            paddingstring   : '    ',
            markerstring    : '|_  ',
            branchstring    : '|'
        };

        if (options) {
            this.options = Object.assign(this.options, options)
        }
    }

    /**
     * 
     * @param {Object} item
     * @param {Object} funcMap
     * @param {string[]} lines 
     * @returns string 
     */
    _format(item, funcMap, lines, depth, parentLineIndex) {
        let indentStr = '';
        let marker = '';

        // If depth is 0, means it is root element and neither padding
        // nor marker is needed
        if (depth) {
            indentStr = `${this.options.paddingstring.repeat(depth - 1)}`;
            marker = this.options.markerstring; 
        }

        // Print '|' from the line next to parent, to this current line
        // First find out which column it needs to go
        const colIndex = indentStr.length;

        // Now print '|' in every line below parent
        for (let i = parentLineIndex + 1; i < lines.length; ++i) {
            const p1 = lines[i].substring(0, colIndex);

            const p2 = lines[i].substring(colIndex + this.options.branchstring.length);
            lines[i] = p1 + this.options.branchstring + p2;
        }

        // This is the item, simply print |_  item.name and push to lines array
        lines.push(`${indentStr}${marker}${item.name}`);

        // Now about children
        if (!item.children || !item.children.length)
            return;

        
        // Get the current line index at this point, cos lines.length
        // gonna keep changing (increasing) in this loop 
        const currentLineIndex = lines.length - 1;
        ++depth;
        for (let id of item.children) {
            const child = funcMap[id];

            this._format(child, funcMap, lines, depth, currentLineIndex);
        }
    }

    /**
     * Appends the output to parentElement
     * @param {Object} funcMap 
     * @param {HTMLElement} parentElement A div to output to
     */
    format(funcMap, parentElement) {
        const root = funcMap[0];
        let lines = [];
        this._format(root, funcMap, lines, 0, -1);

        const text = lines.join('\n');
        // Create a <pre> element and assign it to the parentElement
        const pre = document.createElement('pre');
        pre.innerHTML = text;

        parentElement.appendChild(pre);
    }
}