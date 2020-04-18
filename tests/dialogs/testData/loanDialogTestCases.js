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
        name: 'Check Name input',
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
        
        name: 'input email',
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
            
         }
    },
     {
        name: 'User accepts rate and enters dialog',
         initialData: {
           
            lender: 'AIB'
                     },
           steps: [
               
            ['y','The most current rates:'],
            ['Joe','Some rates from our most popular lenders, happy to proceed? (y/n)'],
            
             ],
            expectedStatus: 'waiting',
            expectedResult: {
                amount: '12000',
                lender: 'AIB',
                birthDate: '01/01/01'
                            }
      },
      
    {
        name: 'Proceed with rates',
        initialData: {},
        steps: [
            ['hi', 'The most current rates:'],
            ['cancel', 'Some rates from our most popular lenders, happy to proceed? (y/n)']
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    {
        name: 'See current rates',
        initialData: {},
        steps: [
         
            ['y', 'The most current rates:'],
            ['1000', 'Some rates from our most popular lenders, happy to proceed? (y/n)'],
            
        
         
        ],
        expectedStatus: 'waiting',
        expectedResult: undefined
    }
 
];
