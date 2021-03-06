import * as assert from 'assert';
import cronRegex from '../../regex';
import * as samples from './samples';

suite('regex', () => {
    const regexp = new RegExp(`^${cronRegex}$`, 'i');

    samples.positive.forEach((string) =>
        test(`${string} is valid`, () => {
            assert.ok(regexp.test(string));
        })
    );

    samples.negative.forEach((string) =>
        test(`${string} is not valid`, () => {
            assert.ok(!regexp.test(string));
        })
    );
});
