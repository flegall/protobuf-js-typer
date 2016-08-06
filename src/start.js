// @flow
import yargs from 'yargs';
const argv = yargs
    .usage('Usage: $0 [protocolFile] [typeDefinitionFile] --syntax [syntax]')
    .demand(2, 'You must provide a protocolFile and a target typeDefinitionFile')
    .demand('syntax')
    .alias('syntax', 's')
    .nargs('syntax', 1)
    .describe('syntax', 'Choose your language syntax')
    .choices('syntax', ['flow', 'typescript'])
    .example('$0 file.proto typeDef.js -s flow',
        'Generate a flowtype definition file from the .proto file')
    .example('$0 file.proto typeDef.ts -syntax typescript',
        'Generate a typescript definition file from the .proto file')
    .epilog('https://github.com/flegall/protobuf-js-typer')
    .help()
    .strict()
    .argv;

const {_: [protocolFile, typeDefinitionFile], syntax} = argv;

export default function start() {
    execute(protocolFile, typeDefinitionFile, syntax);
}

export function execute(protocolFile:string, typeDefinitionFile: string, syntax: string) {
    
}
