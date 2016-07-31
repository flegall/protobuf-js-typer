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
    const proto = `message SimpleMessage {
        string query = 1;
    }`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(1);
    const [message] = messages;
    expect(message).to.deep.equal({name: 'SimpleMessage', fields: [
        {
            name: 'query',
            type: 'string',
            repeated: false,
        },
    ]});
});

test('Parser - Parses a repeated/non-repeated fields', () => {
    const proto = `message SimpleMessage {
        string query = 1;
        repeated string options = 2;
    }`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(1);
    const [message] = messages;
    expect(message).to.deep.equal({name: 'SimpleMessage', fields: [
        {
            name: 'query',
            type: 'string',
            repeated: false,
        },
        {
            name: 'options',
            type: 'string',
            repeated: true,
        },
    ]});
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
