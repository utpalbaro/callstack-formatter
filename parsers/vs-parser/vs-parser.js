export class VSStackParser {
    static _getFuncInfo(lines) {
        const len = lines.length;

        if (len > 2 || len < 1)
            return null;

        let filename = '';
        let regex = null;
        if (len == 2) {
            regex = /at (.+)\(\d+\)/g;
            let m = regex.exec(lines[1]);

            filename = m ? m[1] : '';
        }

        regex = />*\s*(.+)!(.+)\((.+)\)\s*Line\s*(\d+)/g;
        const m = regex.exec(lines[0]);

        if (!m)
            return null;

        return {
            module : m[1],
            name : m[2],
            args : m[3],
            line : m[4],
            path : filename
        };
    }

    /**
     * 
     * @param {string} lines 
     */
    static _removeEmptyLines(lines) {
        const newLines = [];
        for (let line of lines) {
            if (line.trim() !== '')
                newLines.push(line);
        }

        return newLines;
    }
    
    /**
     * Parses to standard call tree format
     * @param {string} stack
     * @returns {Object | null} list
     */
    static parse(stack) {
        // split into lines
        let lines = stack.split(/\r?\n/);
        lines = VSStackParser._removeEmptyLines(lines);

        const funcMap = {};
        const funcList = [];

        // Need to check if it is a callstack with source paths or without
        let i = 0;
        let funcId = 0;
        let data = null;
        while (i < lines.length) {
            if (i < lines.length - 1) {
                if (lines[i+1].includes('at ')) {
                    data = VSStackParser._getFuncInfo(lines.slice(i, i + 2));
                    if (data)
                        funcList.push(data);

                    i += 2;
                    continue;
                }
            }

            data = VSStackParser._getFuncInfo(lines.slice(i, i + 1));
            if (data)
                funcList.push(data);
            i += 1;
        }

        // Now create a funcMap from funcList
        if (funcList.length === 0)
            return null;  // empty object

        // Insert the root
        funcMap[0] = funcList[0];

        // Insert the children
        for (let i = 1; i < funcList.length; ++i) {
            funcMap[i-1].children = [i];
            funcMap[i] = funcList[i];
        }

        return funcMap;
    }
}