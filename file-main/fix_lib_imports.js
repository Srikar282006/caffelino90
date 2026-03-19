const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
    const importRegex = /(from\s+['"][^'"]+)@\d+\.\d+\.\d+(['"])/g;
    let count = 0;

    function walkSync(currentDirPath) {
        fs.readdirSync(currentDirPath).forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile() && /\.(tsx|ts|jsx|js)$/.test(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content.replace(importRegex, '$1$2');
                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated ${filePath}`);
                    count++;
                }
            } else if (stat.isDirectory() && name !== 'node_modules') {
                walkSync(filePath);
            }
        });
    }

    walkSync(directory);
    console.log(`Total source files updated: ${count}`);
}

processDirectory("c:/Users/1sriv/Downloads/file-main/file-main/src");
