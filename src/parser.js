// @flow
import PEG from 'pegjs';
import path from 'path';
import fs from 'fs';

export type FieldType = 'double' | 'float' | 'int32' | 'int64' | 'uint32' |
    'uint64' | 'sint32' | 'sint64' | 'fixed32' | 'fixed64' | 'sfixed32' |
    'sfixed64' | 'bool' | 'string' | 'bytes';
export type Field = {
    name: string;
    type: FieldType;
    repeated: boolean;
};
export type Message = {
    name: string;
    fields: Field[];
}
export type ProtocolFile = {
    fullPath: string;
    messages: Message[];
}

const GRAMMAR: string = `
start
    = messages

messages
    = message*

message
    = 'message' _* messageName:IdentifierName _* {return {
        name: messageName,
        fields: [],
    };}

IdentifierName "identifier"
    = head:IdentifierStart tail:IdentifierPart* {
        return head + tail.join('');
    }

IdentifierStart
    = [A-Za-z]
    / "$"
    / "_"

IdentifierPart
    = IdentifierStart
    / [0-8]

_ "whitespace"
    = "\t"
    / "\\n"
    / "\v"
    / "\f"
    / " "
    / "\u00A0"
    / "\uFEFF"
    / [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]
`;

export default function parseFile(fileName: string): ProtocolFile {
    const absolutePath = path.resolve(fileName);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const parser = PEG.buildParser(GRAMMAR);
    const messages = parser.parse(fileContent);
    return {fullPath: absolutePath, messages};
}
