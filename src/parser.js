// @flow
import PEG from 'pegjs';
import path from 'path';
import fs from 'fs';

export type FieldType = 'double' | 'float' | 'int32' | 'int64' | 'uint32' |
    'uint64' | 'sint32' | 'sint64' | 'fixed32' | 'fixed64' | 'sfixed32' |
    'sfixed64' | 'bool' | 'string' | 'bytes' | string;
export type Field = {
    name: string;
    type: FieldType;
    repeated: boolean;
};
export type Enum = {
    name: string;
    values: EnumValue[];
};
export type EnumValue = {
    value: string;
};
export type Message = {
    name: string;
    fields: Field[];
    enums: Enum[];
};
export type ParsedProtocolFile = {
    fullPath: string;
};
type ProtocolFile = {
    messages: Message[];
    enums: Enum[];
};
type FieldDefinition = {
    instanceOf: 'field';
} & Field;
type EnumDefinition = {
    instanceOf: 'enum';
} & Enum;
type MessageDefinition = {
    instanceOf: 'message';
} & Message;
type MessageOrEnum = MessageDefinition | EnumDefinition;
type MessageInternal = FieldDefinition | EnumDefinition;

function buildProtocolFile(messagesOrEnums: MessageOrEnum[]): ProtocolFile {
    const enums: EnumDefinition[] = cast(messagesOrEnums.filter(
        ({instanceOf}) => instanceOf === 'enum'));
    const messages: MessageDefinition[] = cast(messagesOrEnums.filter(
        ({instanceOf}) => instanceOf === 'message'));
    return {
        messages: messages.map(({instanceOf, name, fields, enums}) => ({name, fields, enums})),
        enums: enums.map(({instanceOf, name, values}) => ({name, values})),
    };
}

function buildMessageDefinition(messageName: string, messageInternals: MessageInternal[]): MessageDefinition {
    const fields: FieldDefinition[] = cast(messageInternals.filter(
        ({instanceOf}) => instanceOf === 'field'));
    const enums: EnumDefinition[] = cast(messageInternals.filter(
        ({instanceOf}) => instanceOf === 'enum'));

    return {
        name: messageName,
        fields: fields.map(toField),
        enums: enums.map(toEnum),
        instanceOf: 'message',
    };
}

function buildFieldDefinition(name: string, type: FieldType, repeated: ?string): FieldDefinition {
    return {
        instanceOf: 'field',
        name: name,
        type: type,
        repeated: !!repeated,
    };
}

function toField({name, type, repeated}: FieldDefinition): Field {
    return {
        name, type, repeated,
    };
}

function buildEnumDefinition(name: string, values: EnumValue[]): EnumDefinition {
    return {
        instanceOf: 'enum',
        name, values,
    };
}

function toEnum({name, values}: EnumDefinition): Enum {
    return {
        name, values,
    };
}

function buildEnumValue(value: string): EnumValue {
    return {
        value,
    };
}

function exportFunctions(...functions: Function[]): string {
    return `
        {
            ${functions.map(f => f.toString()).join('\n')}
        }
    `;
}

const GRAMMAR: string = `
${exportFunctions(
    buildProtocolFile,
    buildMessageDefinition,
    buildFieldDefinition, toField,
    buildEnumDefinition, buildEnumValue, toEnum,
    cast)}

start
    = ProtocolFile
ProtocolFile "protocol file"
    = messagesOrEnums:MessageOrEnum* {
        return buildProtocolFile(messagesOrEnums);
    }

MessageOrEnum "message or enum"
    = MessageDefinition
    / EnumDefinition

MessageDefinition "message"
    = _* 'message' _* messageName:IdentifierName _* "{" _* internals:MessageInternal* _* "}" _* {
        return buildMessageDefinition(messageName, internals);
    }

MessageInternal "message internal definition"
    = FieldDefinition
    / EnumDefinition

EnumDefinition "enum definition"
    = _* 'enum' _+ name:IdentifierName _* '{' _* values:EnumValue+ _* '}' _* {
        return buildEnumDefinition(name, values);
    }

EnumValue "enum value"
    = _* name:IdentifierName _+ '=' _+ Number _* ';' _* {
        return buildEnumValue(name);
    }

FieldDefinition "field definition"
    = _* repeated:Repeated? _* type:FieldType _+ name:IdentifierName _* "=" _* Number _* ";" _* {
        return buildFieldDefinition(name, type, repeated);
    }

Repeated "repeated options"
    = 'repeated' _

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
    / IdentifierName

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

_ "whitespace or comments"
    = "\t"
    / "\\n"
    / "\v"
    / "\f"
    / " "
    / "\u00A0"
    / "\uFEFF"
    / [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]
    / '//' [^\\n]* '\\n'
    / "/*" (!"*/" .)* "*/"
`;
const PARSER = PEG.buildParser(GRAMMAR);

export default function parseFile(fileName: string): ParsedProtocolFile {
    const fullPath = path.resolve(fileName);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const messages = PARSER.parse(fileContent);

    return {
        fullPath,
        ...(parseString(fileContent)),
    }
}

export function parseString(fileContent: string): ProtocolFile {
    return PARSER.parse(fileContent);
}

function cast<T>(value: any): T {
    return value;
}
