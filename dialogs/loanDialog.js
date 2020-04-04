// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { NamePrompt } = require('../prompts/namePrompt');
const { EmailPrompt } = require('../prompts/emailPrompt');
const { AmountPrompt } = require('../prompts/amountPrompt');
const { TermPrompt } = require('../prompts/termPrompt');

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory} = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog,ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');
const GET_NAME_PROMPT = 'namePrompt';
const GET_EMAIL_PROMPT = 'emailPrompt';
const GET_AMOUNT_PROMPT = 'amountPrompt';
const GET_TERM_PROMPT = 'termPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
var validator = require('validator');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const mseg = {
    to: 'aoife_80@msn.com',
    from: 'aoife_80@msn.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

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
                this.nameStep.bind(this),
                this.emailStep.bind(this),
                this.amountStep.bind(this),
                this.termStep.bind(this),
                this.lenderTypeStep.bind(this),
                this.birthDateStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
                
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async nameStep(stepContext) {
        const loanDetails = stepContext.options;
    
        if (!loanDetails.name) {
            
            return await stepContext.prompt(GET_NAME_PROMPT, 'What is your name?');
           
        }
            return await stepContext.next(loanDetails.name);
        }
    

     
    
    async emailStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.name = stepContext.result;
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
    async termStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.amount = stepContext.result;
        if (!loanDetails.term) {
       return await stepContext.prompt(GET_TERM_PROMPT, 'How long would you like the term (1-6)');
    
    }

    return await stepContext.next(loanDetails.term);
    }

    
    async lenderTypeStep(stepContext) {
        const loanDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        loanDetails.term = stepContext.result;
        if (!loanDetails.lenderType) {
            const messageText = 'From what type of lender would you like a loan?';
            const msg = MessageFactory.text(messageText, 'From what type of lender would you like a loan?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(loanDetails.lenderType);
    }

    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async birthDateStep(stepContext) {
        const loanDetails = stepContext.options;

        // Capture the results of the previous step
        loanDetails.lenderType = stepContext.result;
        if (!loanDetails.birthDate || this.isAmbiguous(loanDetails.birthDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: loanDetails.birthDate });
        }
        return await stepContext.next(loanDetails.birthDate);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const loanDetails = stepContext.options;
        if (!loanDetails.choice) {
        // Capture the results of the previous step
        loanDetails.birthDate = stepContext.result;
        const messageText = `Please confirm, I have you a loan for ${ loanDetails.amount} from: ${ loanDetails.lenderType } your birth date is: ${ loanDetails.birthDate }. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        }
        return await stepContext.next(loanDetails.choice);
    }
   

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        
        if (stepContext.result === true) {
            const loanDetails = stepContext.options;
            
            console.log(calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`));




            const messageText = `Your Monthly payment would be: ${calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`)} , an email with quote details has been sent, do you wish to check you eligibility for a loan? `;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
           
            //return await stepContext.endDialog(loanDetails);
        }
        const value = prompt.recognized.value;
        if (value == 'Yes')
        {
            return await stepContext.endDialog(loanDetails);
        }
        
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
    
   
}



function calcLoanAmount(loanTerm,loanAmount)
{
   // https://www.ifsautoloans.com/blog/car-loan-interest/
    const divisor = 12.00;
    const APR = .10;
    const interestRate = APR/divisor;
    let middle = 1 + (interestRate);
    let term =loanTerm*divisor;
    let top = interestRate* loanAmount;
    let bottom = (1-(middle)**(-term));
    let monthlyRepayment = top/bottom;
        console.log(middle);
        console.log(bottom);
  return `${monthlyRepayment.toFixed(2)}`

  
}

module.exports.LoanDialog = LoanDialog;
