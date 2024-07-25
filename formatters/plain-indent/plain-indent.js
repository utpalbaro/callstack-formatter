export class PlainIndentFormatter {
    constructor(options) {
        this.options = {
            paddingstring   : '    '
        };

        if (options) {
            this.options = Object.assign(this.options, options)
        }

        this._depth = 0;
    }

    /**
     * Returns the formatted string
     * @param {Object} item
     * @param {Object} funcMap
     * @returns string 
     */
    _format(item, funcMap) {
        let formatStr = `${item.name}\n`;

        // If item has no children, nothing to do
        if (!item.children || !item.children.length) {
            return formatStr;
        }

        // Increase the depth value before entering this loop
        ++this._depth;
        
        const indentStr = this.options.paddingstring.repeat(this._depth);
        for (let id of item.children) {
            const child = funcMap[id];
            formatStr += `${indentStr}${this._format(child, funcMap)}`;
        }

        // Decrement it back now that we're out
        --this._depth;

        return formatStr;
    }

    /**
     * 
     * @param {Object} funcMap 
     * @param {HTMLElement} parentElement 
     */
    format(funcMap, parentElement) {
        // reset the depth
        this._depth = 0;

        const root = funcMap[0];
        const text = this._format(root, funcMap);
        // Create a <pre> element and assign it to the parentElement
        const pre = document.createElement('pre');
        pre.innerHTML = text;

        parentElement.appendChild(pre);
    }
}