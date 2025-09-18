// Temporary script to parse global.js and extract structure
const fs = require('fs');
const path = require('path');

function parseGlobalJS() {
    const filePath = path.join(__dirname, '../siteScripts/global.js');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const structure = {
        constants: [],
        objects: [],
        classes: [],
        functions: [],
        imports: [],
        totalLines: lines.length
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNumber = i + 1;
        
        // Match imports
        if (line.startsWith('import ')) {
            structure.imports.push({
                name: line,
                line: lineNumber,
                type: 'import'
            });
        }
        
        // Match const declarations
        if (line.startsWith('const ')) {
            const match = line.match(/^const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
            if (match) {
                const name = match[1];
                const isObject = line.includes(' = {') || lines[i + 1]?.trim() === '{';
                const isArray = line.includes(' = [');
                const isFunction = line.includes(' = (') || line.includes(' = function');
                
                structure.constants.push({
                    name,
                    line: lineNumber,
                    type: isObject ? 'object' : isArray ? 'array' : isFunction ? 'function' : 'constant',
                    value: line.split('=')[1]?.trim() || ''
                });
            }
        }
        
        // Match class declarations
        if (line.startsWith('class ')) {
            const match = line.match(/^class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (match) {
                const name = match[1];
                structure.classes.push({
                    name,
                    line: lineNumber,
                    type: 'class'
                });
            }
        }
        
        // Match function declarations
        if (line.startsWith('function ')) {
            const match = line.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (match) {
                const name = match[1];
                structure.functions.push({
                    name,
                    line: lineNumber,
                    type: 'function'
                });
            }
        }
    }
    
    return structure;
}

const parsed = parseGlobalJS();
console.log(JSON.stringify(parsed, null, 2));