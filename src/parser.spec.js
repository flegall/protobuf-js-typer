// @flow
import parser from './parser';

import test from 'ava';
import {expect} from 'chai';

import path from 'path';

test('Parser - Returns the full path of the .proto file', () => {
    const fileName = './test-data/simple.proto';
    const expectedPath = path.resolve(fileName);

    const {fullPath} = parser(fileName);

    expect(fullPath).to.equal(expectedPath);
});

test('Parser - Parses a simple message', () => {
    const fileName = './test-data/simple.proto';

    const {messages} = parser(fileName);

    expect(messages).to.have.length(1);
    const [message] = messages;
    expect(message).to.deep.equal({name: 'SimpleMessage', fields: []});
});
