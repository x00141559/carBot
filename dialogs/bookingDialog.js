// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog,ChoiceFactory,ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');
const CHOICE_PROMPT = 'choicePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

//const CHOICE_PROMPT = 'CHOICE_PROMPT';
class BookingDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'bookingDialog');
        
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.amountStep.bind(this),
                this.termStep.bind(this),
                this.lenderTypeStep.bind(this),
                this.birthDateStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
                
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If an amount has not been provided, prompt for one.
     */
    async amountStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.amount) {
            const messageText = 'How much would you like to borrow?';
            const msg = MessageFactory.text(messageText, 'How much would you like to borrow?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.amount);
    }
    async termStep(stepContext) {
        const bookingDetails = stepContext.options;
        bookingDetails.amount = stepContext.result;
        if (!bookingDetails.term) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.
        // return await stepContext.prompt(CHOICE_PROMPT, {
        //     prompt: 'Please enter your loan term in years.',
        //     choices: ChoiceFactory.toChoices(['1', '2', '3','4','5','6'])
        const messageText = 'How long would you like the term (1-6)';
        const msg = MessageFactory.text(messageText, 'How long would you like the term (1-6)', InputHints.ExpectingInput);
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    
    }

    return await stepContext.next(bookingDetails.term);
    }

    /**
     * If an origin city has not been provided, prompt for one.
     */
    async lenderTypeStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        bookingDetails.term = stepContext.result;
        if (!bookingDetails.lenderType) {
            const messageText = 'From what type of lender would you like a loan?';
            const msg = MessageFactory.text(messageText, 'From what type of lender would you like a loan?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.lenderType);
    }

    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async birthDateStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.lenderType = stepContext.result;
        if (!bookingDetails.birthDate || this.isAmbiguous(bookingDetails.birthDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.birthDate });
        }
        return await stepContext.next(bookingDetails.birthDate);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.birthDate = stepContext.result;
        const messageText = `Please confirm, I have you a loan for ${ bookingDetails.amount} from: ${ bookingDetails.lenderType } your birth date is: ${ bookingDetails.birthDate }. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        
    }
   

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
 
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            
            console.log(calcLoanAmount(`${bookingDetails.term}`,`${bookingDetails.amount}`));
           
            const messageText = `Your Monthly payment would be: ${calcLoanAmount(`${bookingDetails.term}`,`${bookingDetails.amount}`)} , do you wish to have an advisor contact you in relation to this quote? `;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
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

module.exports.BookingDialog = BookingDialog;
