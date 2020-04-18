/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-env node, mocha */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { LoanDialog } = require('../../dialogs/loanDialog');
const assert = require('assert');

describe('LoanDialog', () => {
    const testCases = require('./testData/loanDialogTestCases.js');
    const sut = new LoanDialog('loanDialog');

    testCases.map(testData => {
        it(testData.name, async () => {
            const client = new DialogTestClient('test', sut, testData.initialData, [new DialogTestLogger()]);

            // Execute the test case
            console.log(`Test Case: ${ testData.name }`);
            console.log(`Dialog Input ${ JSON.stringify(testData.initialData) }`);
            for (let i = 0; i < testData.steps.length; i++) {
                const reply = await client.sendActivity(testData.steps[i][0]);
                assert.strictEqual((reply ? reply.text : null), testData.steps[i][1], `${ reply ? reply.text : null } != ${ testData.steps[i][1] }`);
            }

            assert.strictEqual(client.dialogTurnResult.status, testData.expectedStatus, `${ testData.expectedStatus } != ${ client.dialogTurnResult.status }`);

            console.log(`Dialog result: ${ JSON.stringify(client.dialogTurnResult.result) }`);
            if (testData.expectedResult !== undefined) {
                // Check dialog results
                const result = client.dialogTurnResult.result;
                
                assert.strictEqual(result.amount, testData.expectedResult.amount);
                assert.strictEqual(result.lender, testData.expectedResult.lender);
                assert.strictEqual(result.birthDate, testData.expectedResult.birthDate);
                assert.strictEqual(result.name, testData.expectedResult.name);
            } else {
                assert.strictEqual(client.dialogTurnResult.result, undefined);
            }
        });
    });
});
