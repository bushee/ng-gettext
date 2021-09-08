const readPoFiles = require('./read-po-files');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
    .option('input', {
        type: 'string',
        array: true,
        demandOption: true,
        description: 'directories containing .po files'
    })
    .option('output', {
        type: 'string',
        demandOption: true,
        description: 'path to output file'
    }).argv;

readPoFiles(args.input)
    .then(translations =>
        fs.promises
            .mkdir(path.dirname(args.output), { recursive: true })
            .then(() =>
                fs.promises.writeFile(
                    path.join(args.output),
                    '/* tslint:disable */\n\n' +
                        '// this file is generated automatically\n' +
                        '// do not edit it manually\n\n' +
                        "// @ts-ignore\nimport {TranslationsCache} from '../lib/gettext/translations-cache';\n\n" +
                        `// @ts-ignore\nexport const translationsCache: TranslationsCache = {cache: ${JSON.stringify(
                            translations
                        )}};\n`
                )
            )
    )
    .catch(err => {
        console.error(err);
        process.exit(1);
    });