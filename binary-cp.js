import fs from 'fs';
import readline from 'readline';
import clipboardy from 'clipboardy';

// Convert your file to hexadecimal

// $ xxd originalFile > hexaFile

// Convert back your hexadecimal file to original

// $ cat hexaFile |  xxd –r > backOriginalFile


const readAndCopyFile = async (filename, chunkSize = 12000) => {
    try {
        const fileStream = fs.createReadStream(filename, 'utf8');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lines = [];
        let lineNumber = 0;

        for await (const line of rl) {
            lines.push(line);
            lineNumber++;

            if (lineNumber % chunkSize === 0) {
                await copyToClipboard(lines.join('\n'));
                lines = [];
                console.log(`Copied lines ${lineNumber - chunkSize + 1} to ${lineNumber} to clipboard. Press Space to continue...`);
                await waitForSpacebar();
            }
        }

        // Copy the remaining lines to clipboard
        if (lines.length > 0) {
            await copyToClipboard(lines.join('\n'));
            console.log(`Copied lines ${lineNumber - lines.length + 1} to ${lineNumber} to clipboard. End of file.`);
        }

        rl.close();
    } catch (error) {
        console.error('Error occurred:', error);
    }
};

const copyToClipboard = async (content) => {
    await clipboardy.write(content);
};

const waitForSpacebar = () => {
    return new Promise(resolve => {
        process.stdin.on('keypress', (chunk, key) => {
            if (key && key.name === 'space') {
                process.stdin.removeAllListeners('keypress');
                resolve();
            }
        });
    });
};

// Setup input event listener for standard input
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

const filename = process.argv[2];
if (!filename) {
    console.error('Please provide a filename.');
    process.exit(1);
}

readAndCopyFile(filename);
