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
    expect(message).to.deep.equal({name: 'SimpleMessage', enums: [], fields: [
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
    expect(message).to.deep.equal({name: 'SimpleMessage', enums: [], fields: [
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
        {name: 'FirstMessage', enums: [], fields: []},
        {name: 'SecondMessage', enums: [], fields: []},
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

test('Parser - Handles // comments everywhere', () => {
    const proto = `
    // first
    message FirstMessage { }
    message SecondMessage { }// a command at the of the line
    // message CommentedMessage { }
`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(2);
});

test('Parser - Handles /* */ comments everywhere', () => {
    const proto = `
    /* comment */
    message FirstMessage {/*nothing here*/}
    /*
    message CommentedMessage1
    */
    message SecondMessage { }/*
    message CommentedMessage2
    */
`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(2);
});

test('Parser - Parses enums', () => {
    const proto = `enum Corpus {
        UNIVERSAL = 0;
            WEB = 1;
    }`;

    const {enums} = parseString(proto, 'some.proto');

    expect(enums).to.have.length(1);
    expect(enums[0]).to.deep.equal({
        name: 'Corpus',
        values: [
            {value: 'UNIVERSAL'},
            {value: 'WEB'},
        ],
    });
});

test('Parser - Parses enums inside a message', () => {
    const proto = `message SimpleMessage {
        Corpus corpus = 1;
        enum Corpus {
            UNIVERSAL = 0;
            WEB = 1;
        }
    }`;

    const {messages} = parseString(proto, 'some.proto');

    expect(messages).to.have.length(1);
    const [message] = messages;
    expect(message).to.deep.equal({name: 'SimpleMessage', fields: [
        {
            name: 'corpus',
            type: 'Corpus',
            repeated: false,
        },
    ], enums: [
        {
            name: 'Corpus',
            values: [
                {value: 'UNIVERSAL'},
                {value: 'WEB'},
            ],
        }
    ]});
});
