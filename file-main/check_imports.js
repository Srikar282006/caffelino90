const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
    const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
    
    let issues = [];

    function walkSync(currentDirPath) {
        fs.readdirSync(currentDirPath).forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile() && /\.(tsx|ts|jsx|js)$/.test(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                function checkImport(imp) {
                    if (imp.startsWith('.')) {
                        // resolve the path
                        let resolvedPath = path.resolve(currentDirPath, imp);
                        let extFound = false;
                        
                        if (!fs.existsSync(resolvedPath)) {
                            const exts = ['.tsx', '.ts', '.jsx', '.js', '.json', '.css'];
                            for (let ext of exts) {
                                if (fs.existsSync(resolvedPath + ext)) {
                                    resolvedPath = resolvedPath + ext;
                                    extFound = true;
                                    break;
                                }
                            }
                            if (!extFound) {
                                if (fs.existsSync(path.join(resolvedPath, 'index.tsx'))) { resolvedPath = path.join(resolvedPath, 'index.tsx'); extFound = true; }
                                else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) { resolvedPath = path.join(resolvedPath, 'index.ts'); extFound = true; }
                                else if (fs.existsSync(path.join(resolvedPath, 'index.js'))) { resolvedPath = path.join(resolvedPath, 'index.js'); extFound = true; }
                                else if (fs.existsSync(path.join(resolvedPath, 'index.jsx'))) { resolvedPath = path.join(resolvedPath, 'index.jsx'); extFound = true; }
                            }
                        } else {
                             let statRP = fs.statSync(resolvedPath);
                             if (statRP.isDirectory()) {
                                 let idxtsx = path.join(resolvedPath, 'index.tsx');
                                 let idxts = path.join(resolvedPath, 'index.ts');
                                 let idxjs = path.join(resolvedPath, 'index.js');
                                 if (fs.existsSync(idxtsx)) { resolvedPath = idxtsx; extFound = true; }
                                 else if (fs.existsSync(idxts)) { resolvedPath = idxts; extFound = true; }
                                 else if (fs.existsSync(idxjs)) { resolvedPath = idxjs; extFound = true; }
                             } else {
                                extFound = true;
                             }
                        }

                        if (!extFound) {
                            issues.push({file: filePath, msg: `Unresolved path: ${imp}`});
                        } else {
                            try {
                                let dir = path.dirname(resolvedPath);
                                let base = path.basename(resolvedPath);
                                let actualFiles = fs.readdirSync(dir);
                                if (!actualFiles.includes(base)) {
                                    issues.push({file: filePath, msg: `Casing mismatch for: ${imp} -> Expected exactly case-matched filename`});
                                }
                            } catch (e) {}
                        }
                    }
                }

                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    checkImport(match[1]);
                }
                while ((match = dynamicImportRegex.exec(content)) !== null) {
                    checkImport(match[1]);
                }
                
                // Also check for 'export X from "./Y"'
                const exportRegex = /export\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
                while ((match = exportRegex.exec(content)) !== null) {
                    checkImport(match[1]);
                }
            } else if (stat.isDirectory() && name !== 'node_modules') {
                walkSync(filePath);
            }
        });
    }

    walkSync(directory);
    console.log(JSON.stringify(issues, null, 2));
}

processDirectory("c:/Users/1sriv/Downloads/file-main/file-main/src");
