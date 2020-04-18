/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const now = new Date();
const tomorrow = formatDate(new Date().setDate(now.getDate() + 1));
const dayAfterTomorrow = formatDate(new Date().setDate(now.getDate() + 2));

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = [
    {
        name: 'none',
        initialData: null,
        steps: [
            ['hi','What is your date of birth?'],
            ['none', `I'm sorry, for best results, please enter your date of birth including the month, day and year.`]
        ],
        expectedResult: undefined
    },
    {
        name: '2009-09-09',
        initialData: null,
        steps: [
            ['hi', 'What is your date of birth?'],
            ['2009-09-09', null]
        ],
        expectedResult: '2009-09-09'
    },
    {
        name: '2001-01-20',
        initialData: null,
        steps: [
            ['hi', 'What is your date of birth?'],
            ['2001-01-20', null]
        ],
        expectedResult: '2001-01-20'
    },
    {
        name: 'valid input given (tomorrow)',
        initialData: { date: tomorrow },
        steps: [
            ['hi', null]
        ],
        expectedResult: tomorrow
    },
    {
        name: 'retry prompt',
        initialData: {},
        steps: [
            ['hi', 'What is your date of birth?'],
            ['bananas', `I'm sorry, for best results, please enter your date of birth including the month, day and year.`],
            ['tomorrow', null]
        ],
        expectedResult: tomorrow
    },
    {
        name: 'fuzzy time',
        initialData: {},
        steps: [
            ['hi', 'What is your date of birth?'],
            ['may 5th', `I'm sorry, for best results, please enter your date of birth including the month, day and year.`],
            ['may 5th 2055', null]
        ],
        expectedResult: '2055-05-05'
    }
];
