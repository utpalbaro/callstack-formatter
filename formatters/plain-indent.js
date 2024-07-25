export class PlainIndentFormatter {
    static _depth = 0;
    static repeatValue = 4;
    static indentChar = ' ';

    /**
     * Returns the formatted string
     * @param {Object} item
     * @param {Object} funcMap
     * @returns string 
     */
    static _format(item, funcMap) {
        let formatStr = `${item.name}\n`;

        // If item has no children, nothing to do
        if (!item.children || !item.children.length) {
            return formatStr;
        }

        // Increase the depth value before entering this loop
        ++this._depth;
        
        const indentStr = this.indentChar.repeat(this._depth*this.repeatValue);
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
    static format(funcMap, parentElement) {
        const root = funcMap[0];
        const text = PlainIndentFormatter._format(root, funcMap);
        // Create a <pre> element and assign it to the parentElement
        const pre = document.createElement('pre');
        pre.innerHTML = text;

        parentElement.appendChild(pre);
    }
}