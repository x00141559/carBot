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
           
            ['hi', 'The most current rates:'],
            ['I would like a loan', 'Some rates from our most popular lenders, happy to proceed? (y/n)'],
            ['Aoife',`What is your name?`],
            ['What is your email',`Thanks Aoife, let's get started with your quote.`],
            [ `x00141559@mytudublin.ie`,'What is your email?'],
            [`x00141559@mytudublin.ie`, `Sorry, but that is not a valid email address, enter in the format name@name.com`],
            
           
        ],
       
        expectedStatus: 'waiting',
       
        expectedResult: {
            name: 'Aoife',
            
            
         }
    },
    {
        name: 'Full flow with \'no\' at confirmation',
        initialData: {},
        steps: [
            [null, 'The most current rates:'],
            [ 'ok','Some rates from our most popular lenders, happy to proceed? (y/n)','y'],
            ['Aoife', 'What is your name?'],
            ['x00141559@mytudublin.ie',`Thanks Aoife, let's get started with your quote.`],
            ['2000', `What is your email?`],
            ['2000','How much would you like to borrow?']
       
        ],
        expectedStatus: 'waiting',
        expectedResult: {
            amount: '2000',
            
            
         }
    },
    {
        
        name: 'Amount given',
            initialData: 
           {
              
           },
         steps: [
            [null,'The most current rates:'],
            ['y', 'Some rates from our most popular lenders, happy to proceed? (y/n)'],
            ['Aoife', 'What is your name?'],
            ['aoife_80@msn.com', `Thanks Aoife, let's get started with your quote.`],
            ['silver', `What is your email?`]
            
         ],
                
         expectedStatus: 'waiting',
         expectedResult: {
            lender: 'Credit Union',
            
            birthDate: '01/01/01'
         }
    },
     {
        name: 'Amount and lender given',
         initialData: {
           
            lender: 'AIB'
                     },
           steps: [
               
            [null,'The most current rates:'],
            ['Joe','Some rates from our most popular lenders, happy to proceed? (y/n)'],
            ['Joe','What is your name?'],
            [ 'x00141559@gmail.com',`Thanks Joe, let's get started with your quote.`],
            ['Yes', `What is your email?`],
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
            ['hi', 'The most current rates:'],
            ['cancel', 'Some rates from our most popular lenders, happy to proceed? (y/n)']
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    {
        name: 'Cancel on loan term prompt',
        initialData: {},
        steps: [
         
            ['y', 'The most current rates:'],
            ['1000', 'Some rates from our most popular lenders, happy to proceed? (y/n)'],
            
        
         
        ],
        expectedStatus: 'waiting',
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
