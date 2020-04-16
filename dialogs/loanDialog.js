// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const {
    NamePrompt
} = require('../prompts/namePrompt');
const {
    EmailPrompt
} = require('../prompts/emailPrompt');
const {
    AmountPrompt
} = require('../prompts/amountPrompt');
// Import AdaptiveCard content.
const BoiCard = require('./resources/boi.json');
const BamlCard = require('./resources/baml.json');
const CreditCard = require('./resources/creditUnion.json');

const {
    TermPrompt
} = require('../prompts/termPrompt');
const {
    TimexProperty
} = require('@microsoft/recognizers-text-data-types-timex-expression');
const {
    InputHints,
    MessageFactory,
    CardFactory
} = require('botbuilder');
const {
    ConfirmPrompt,
    TextPrompt,
    WaterfallDialog,
    ChoicePrompt
} = require('botbuilder-dialogs');
const {
    CancelAndHelpDialog
} = require('./cancelAndHelpDialog');
const {
    DateResolverDialog
} = require('./dateResolverDialog');
const GET_NAME_PROMPT = 'namePrompt';
const GET_EMAIL_PROMPT = 'emailPrompt';
const GET_AMOUNT_PROMPT = 'amountPrompt';
const GET_TERM_PROMPT = 'termPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const Rates = require('./resources/rates');



// Create array of AdaptiveCard content, this will be used to send a card to the user.
const CARDS = [
    BoiCard,
    BamlCard,
    CreditCard
];
class LoanDialog extends CancelAndHelpDialog {

    constructor(id) {
        super(id || 'loanDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new NamePrompt(GET_NAME_PROMPT))
            .addDialog(new AmountPrompt(GET_AMOUNT_PROMPT))
            .addDialog(new TermPrompt(GET_TERM_PROMPT))
            .addDialog(new EmailPrompt(GET_EMAIL_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.displayCardStep.bind(this),
                this.nameStep.bind(this),
                this.emailStep.bind(this),
                this.amountStep.bind(this),
                this.rewardStep.bind(this),
                this.termStep.bind(this),
                this.birthDateStep.bind(this),
                this.lenderStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)

            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }


    async displayCardStep(stepContext) {
        const displayCardStep = stepContext.options;
        // Display the Adaptive Card
        wait(10);
        await stepContext.context.sendActivity({
            text: 'The most current rates:',
            attachments: [CardFactory.adaptiveCard(Rates)],
        });
        // Display a Text Prompt
        return await stepContext.prompt('textPrompt', 'Some rates from our most popular lenders');
    }
   
    //ask user for name
    async nameStep(stepContext) {
        const loanDetails = stepContext.options;

        if (!loanDetails.name) {

            return await stepContext.prompt(GET_NAME_PROMPT, 'What is your name?');

        }

        return await stepContext.next(loanDetails.name);


    }



    //collect user email address
    async emailStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.name = stepContext.result;
        stepContext.context.sendActivity(`Thanks ${ stepContext.result }, let's get started with your quote.`);
        if (!loanDetails.email) {

            return await stepContext.prompt(GET_EMAIL_PROMPT, 'What is your email?');

        }

        return await stepContext.next(loanDetails.email);
    }




    async amountStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.email = stepContext.result;
        if (!loanDetails.amount) {

            return await stepContext.prompt(GET_AMOUNT_PROMPT, 'How much would you like to borrow?');

        }

        return await stepContext.next(loanDetails.amount);
    }


    async rewardStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.amount = stepContext.result;
        if (!loanDetails.reward) {

            //   return await stepContext.prompt(GET_REWARD_PROMPT, 'Choose your reward level');
            // ListStyle passed in as Enum
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Please choose a reward level.',
                retryPrompt: 'Sorry, please choose a reward level from the list.',
                choices: ['silver', 'gold', 'honors', 'not a member'],
            });
        }
        console.log('result', stepContext.result);


        return await stepContext.next(loanDetails.reward);
    }
    //ask the user how many years they would like for loan term
    async termStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.reward = stepContext.result.value;
        if (!loanDetails.term) {

            return await stepContext.prompt(GET_TERM_PROMPT, 'How long would you like the term in years (1-6)');

        }


        return await stepContext.next(loanDetails.term);
    }




    /**
     * If a birth date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async birthDateStep(stepContext) {
        const loanDetails = stepContext.options;

        // Capture the results of the previous step
        loanDetails.term = stepContext.result;
        if (!loanDetails.birthDate || this.isAmbiguous(loanDetails.birthDate)) {

            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, {
                date: loanDetails.birthDate
            });

        }



       
        if (calculateAge(`${loanDetails.birthDate}`) < 18) {
            const messageText = `Sorry, you must be older than 18 to apply for a loan with us`;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
           

        }
        return await stepContext.next(loanDetails.birthDate);
    }

    async lenderStep(stepContext) {

        const loanDetails = stepContext.options;
        loanDetails.birthDate = stepContext.result;
          if (!loanDetails.APR) {
             let card;
            if (calculateAge(`${loanDetails.birthDate}`) < 18) {
                const messageText = `Sorry, you must be older than 18 to apply for a loan with us`;
                const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
                // Offer a YES/NO prompt.

            }
            if (`${ loanDetails.amount}` <= 3000) {
                card = CreditCard;
                loanDetails.APR = .5;

            } else if (`${ loanDetails.amount}` <= 5000) {
                card = BoiCard;
                loanDetails.APR = .10;
            } else {
                card = BamlCard;
                loanDetails.APR = .15;
            }
            await stepContext.context.sendActivity({
                text: 'Based on the information provided the lender that would best suit is:',
                attachments: [CardFactory.adaptiveCard(card)]
            });

            // By calling next() you ensure that the next BotHandler is run.
            return await stepContext.next(loanDetails.APR);

        }
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const loanDetails = stepContext.options;
        if (!loanDetails.choice) {
            // Capture the results of the previous step
            loanDetails.APR = stepContext.result;
            if (`${ loanDetails.APR }` == 0.5) {
                loanDetails.lenderType = 'Credit Union'
            } else if (`${ loanDetails.APR}` == .10) {
                loanDetails.lenderType = 'Bank of Ireland'
            } else {
                loanDetails.lenderType = 'Bank of America'
            }
            const messageText = `Please confirm, I have you a loan for ${ loanDetails.amount} from: ${ loanDetails.lenderType } your birth date is: ${ loanDetails.birthDate } and you have a reward membership of 
        ${loanDetails.reward}. Is this correct?`;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.

            return await stepContext.prompt(CONFIRM_PROMPT, {
                prompt: msg
            });

        }



        return await stepContext.next(loanDetails.choice);




    }


    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if ((stepContext.result === false) || (stepContext.result === 'undefined')) {
            const messageText = `Okay, refresh, let's start again`;
            return false;
        } else if (stepContext.result === true) {
            const loanDetails = stepContext.options;
            loanDetails.choice = stepContext.result;
            try {
                if (`${loanDetails.email}` != 'undefined') {
                    `${sendMail(`${loanDetails.email}`, `${loanDetails.term}`, `${loanDetails.amount}`, `${loanDetails.APR}`, `${loanDetails.reward}`)}`

                }
            } catch (e) {
                console.log(e);
            }




            const messageText = `Your Monthly payment would be: ${calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`, `${loanDetails.APR}`,`${loanDetails.reward}`)} , an email with quote details has been sent , do you wish to check you the maximum amount you could borrow? `;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(CONFIRM_PROMPT, {
                prompt: msg
            });

          
        }



    }
    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }


}


// calculate monthly repayment inc discount
function calcLoanAmount(loanTerm, loanAmount, rate, rewardl) {
    try {
    
        let discount;
        if (rewardl == 'silver') {
            discount = .5
        }
        if (rewardl == 'gold') {
            discount = .10
        } else if (rewardl == 'honours') {
            discount = .15
        } else {
            discount = 0
        }

        //months of the year
        const divisor = 12.00;
        //divide rate by months
        const interestRate = rate / divisor;
        let middle = 1 + (interestRate);
        let term = loanTerm * divisor;
        let top = interestRate * loanAmount;
        let bottom = (1 - (middle) ** (-term));
        let monthlyRepayment1 = top / bottom;
    


        let discountcalc = monthlyRepayment1 * discount;
        let monthlyRepayment = monthlyRepayment1 - discountcalc;

        return `${monthlyRepayment.toFixed(2)}`
    } catch (error) {

        console.log(error);
    }

}
//calculate age from date of birth 
function calculateAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
//function to delay adaptive card
function wait(ms)
{
var d = new Date();
var d2 = null;
do { d2 = new Date(); }
while(d2-d < ms);
}
//send email to user with quote
function sendMail(email, loanTerm, loanAmount, rate, rewardl) {

    const sgMail = require('@sendgrid/mail');

    sgMail.setApiKey(process.env.API_KEY);
   
    try {
        const mseg = {

            to: email,
            from: 'aoife_80@msn.com',
            subject: 'Your Quote from autoloans',
            text: `Hi Your quote is:, ${calcLoanAmount(loanTerm,loanAmount,rate,rewardl)}`,
            html: `Hello, thank you for using our auto loan calculator. Your quote is: €
             ${calcLoanAmount(loanTerm,loanAmount,rate,rewardl)}`, 
        };
        sgMail.send(mseg);

    } catch (error) {

        console.log(error);


    }

}


module.exports.LoanDialog = LoanDialog;