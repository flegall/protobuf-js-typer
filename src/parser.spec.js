// @flow
import parser, {parseString} from './parser';

import test from 'ava';
import {expect} from 'chai';

import path from 'path';

test('Parser - Parses a file and returns the full path of the .proto file', () => {
    const fileName = './test-data/simple.proto';
    const expectedPath = path.resolve(fileName);

    const {fullPath} = parser(fileName);

    expect(fullPath).to.equal(expectedPath);
});

test('Parser - Parses a simple message', () => {
    const proto = `message SimpleMessage {}`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(1);
    const [message] = messages;
    expect(message).to.deep.equal({name: 'SimpleMessage', fields: []});
});

test('Parser - Parses multiple messages', () => {
    const proto = `message FirstMessage {}
message SecondMessage {}`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.deep.equal([
        {name: 'FirstMessage', fields: []},
        {name: 'SecondMessage', fields: []},
    ]);
});

test('Parser - Handles whitespace everywhere', () => {
    const proto = `
    message FirstMessage { }
    message SecondMessage { }
`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(2);
});
