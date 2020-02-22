/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const now = new Date();
const today = formatDate(new Date());
const tomorrow = formatDate(new Date().setDate(now.getDate() + 1));

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
        name: 'Full flow',
        initialData: {},
        steps: [
           
            ['hi', 'How much would you like to borrow?'],
            ['12000', 'How long would you like the term (1-6)'],
            ['5', 'From what type of lender would you like a loan?'],
            ['Credit Union', 'What is your date of birth?'],
            ['01/01/01', `Please confirm, I have you a loan for 12000 from: Credit Union your birth date is: 2001-01-01. Is this correct? (1) Yes or (2) No`],
            ['Yes', `Your Monthly payment would be: 254.96 , do you wish to have an advisor contact you in relation to this quote?  (1) Yes or (2) No`],
            ['Yes', null],
           
        ],
        expectedStatus: 'complete',
        expectedResult: {
            lender: 'Credit Union',
            amount: '12000',
            birthDate: '2001-01-01'
        }
    },
    {
        name: 'Full flow with \'no\' at confirmation',
        initialData: {},
        steps: [
            [null, 'How much would you like to borrow?'],
            ['1000', 'How long would you like the term (1-6)'],
            ['2', 'From what type of lender would you like a loan?'],
            ['Credit Union','What is your date of birth?'],
            ['01/01/01', `Please confirm, I have you a loan for 1000 from: Credit Union your birth date is: 2001-01-01. Is this correct? (1) Yes or (2) No`],
            ['No',null]
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    {
        
        name: 'Amount given',
            initialData: 
           {
               amount: '12000'
           },
         steps: [
            [null,'How long would you like the term (1-6)'],
            ['5', 'From what type of lender would you like a loan?'],
            ['Credit Union', 'What is your date of birth?'],
            ['01/01/01', `Please confirm, I have you a loan for 12000 from: Credit Union your birth date is: 2001-01-01. Is this correct? (1) Yes or (2) No`],
            ['Yes', `Your Monthly payment would be: 254.96 , do you wish to have an advisor contact you in relation to this quote?  (1) Yes or (2) No`],
            ['Yes', null]
                ],
         expectedStatus: 'complete',
         expectedResult: {
            lender: 'Credit Union',
            amount: '12000',
            birthDate: '01/01/01'
         }
    },
     {
        name: 'Amount and lender given',
         initialData: {
            amount: '12000',
            lender: 'AIB'
                     },
           steps: [
               
            [null,'How long would you like the term (1-6)'],
            ['5','From what type of lender would you like a loan?'],
            ['AIB','What is your date of birth?'],
            [ '01-01-01','Please confirm, I have you a loan for 12000 from: AIB your birth date is: 2001-01-01. Is this correct? (1) Yes or (2) No'],
            ['Yes', `Your Monthly payment would be: 254.96 , do you wish to have an advisor contact you in relation to this quote?  (1) Yes or (2) No`],
            ['Yes', null]
             ],
            expectedStatus: 'complete',
            expectedResult: {
                amount: '12000',
                lender: 'AIB',
                birthDate: '01/01/01'
                            }
      },
    //   {
    //       name: 'Birthdate is valid',
    //      initialData: {},
    //      steps: [
    //         ['hi', 'How much would you like to borrow?'],
    //         ['1200', 'How long would you like the term (1-6)'],
    //         ['2', 'From what type of lender would you like a loan?'],
    //         ['Credit Union','What is your date of birth?'],

    //         ['01/01/2060', 'Please confirm, I have you a loan for 1200 from: Credit Union your birth date is: 2060-01-01. Is this correct? (1) Yes or (2) No'], 
    //         ['No',null]
    // ],
    //        expectedStatus: 'complete',
    //        expectedResult: {
    //            amount: '12000',
    //            lender: 'Credit Union',
    //            birthDate: '01/01/2060'
    //       }
    //   },
    {
        name: 'Cancel on amount prompt',
        initialData: {},
        steps: [
            ['hi', 'How much would you like to borrow?'],
            ['cancel', 'Cancelling...']
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    {
        name: 'Cancel on loan term prompt',
        initialData: {},
        steps: [
         
            ['hi', 'How much would you like to borrow?'],
            ['1000', 'How long would you like the term (1-6)'],
            ['cancel', 'Cancelling...']
        
         
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    // {
    //     name: 'Cancel on date prompt',
    //     initialData: {},
    //     steps: [
    //         ['hi', 'To what city would you like to travel?'],
    //         ['Seattle', 'From what city will you be travelling?'],
    //         ['New York', 'On what date would you like to travel?'],
    //         ['cancel', 'Cancelling...']
    //     ],
    //     expectedStatus: 'complete',
    //     expectedResult: undefined
    // },
    // {
    //     name: 'Cancel on confirm prompt',
    //     initialData: {},
    //     steps: [
    //         ['hi', 'To what city would you like to travel?'],
    //         ['Seattle', 'From what city will you be travelling?'],
    //         ['New York', 'On what date would you like to travel?'],
    //         ['tomorrow', `Please confirm, I have you traveling to: Seattle from: New York on: ${ tomorrow }. Is this correct? (1) Yes or (2) No`],
    //         ['cancel', 'Cancelling...']
    //     ],
    //     expectedStatus: 'complete',
    //     expectedResult: undefined
    // }
];
