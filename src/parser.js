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
    = Messages

Messages "messages"
    = Message*

Message "message"
    = _* 'message' _* messageName:IdentifierName _* "{" _* fields:FieldDefinition* _* "}" _* { return {
        name: messageName,
        fields: fields,
    };}

FieldDefinition "field definition"
    = _* type:FieldType _ name:IdentifierName _* "=" _* Number _* ";" _* {
        return {
            name: name,
            type: type,
            repeated: false,
        };
    }

FieldType "field type"
    = 'double'
    / 'float'
    / 'int32'
    / 'int64'
    / 'uint32'
    / 'uint64'
    / 'sint32'
    / 'sint64'
    / 'fixed32'
    / 'fixed64'
    / 'sfixed32'
    / 'sfixed64'
    / 'bool'
    / 'string'
    / 'bytes'

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
    / Digit

Number "number"
    = Digit+

Digit "digit"
    = [0-9]

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
const PARSER = PEG.buildParser(GRAMMAR);;

export default function parseFile(fileName: string): ProtocolFile {
    const absolutePath = path.resolve(fileName);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const messages = PARSER.parse(fileContent);
    return parseString(fileContent, absolutePath);
}

export function parseString(fileContent: string, absolutePath: string): ProtocolFile {
    const messages = PARSER.parse(fileContent);
    return {fullPath: absolutePath, messages};
}
