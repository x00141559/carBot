// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory,CardFactory} = require('botbuilder');
const { ConfirmPrompt, TextPrompt, NumberPrompt, WaterfallDialog,ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');
const { IncomePrompt } = require('../prompts/incomePrompt');
const { ExtraPrompt } = require('../prompts/extraPrompt');
const { RepayPrompt } = require('../prompts/repayPrompt');
const { NumChildrenPrompt } = require('../prompts/numChildrenPrompt');
const { NumMainPrompt } = require('../prompts/numMainPrompt');
const GET_INCOME_PROMPT = 'incomePrompt';
const GET_EXTRA_PROMPT = 'extraPrompt';
const GET_REPAY_PROMPT = 'repayPrompt';
const GET_NUMCHILDREN_PROMPT = 'numChildrenPrompt';
const GET_NUMMAIN_PROMPT = 'numMainPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const NUMBER_PROMPT = 'numberPrompt';
const cards = require('./resources/bye');

class ApplicationDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'applicationDialog');
        
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new NumberPrompt(NUMBER_PROMPT))
            .addDialog(new ExtraPrompt(GET_EXTRA_PROMPT))
            .addDialog(new IncomePrompt(GET_INCOME_PROMPT))
            .addDialog(new RepayPrompt(GET_REPAY_PROMPT))
            .addDialog(new NumChildrenPrompt(GET_NUMCHILDREN_PROMPT))
            .addDialog(new NumMainPrompt(GET_NUMMAIN_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.incomeStep.bind(this),
                this.extraIincomeStep.bind(this),
                this.extra.bind(this),
                this.commitmentsStep.bind(this),
                this.repayStep.bind(this),
                this.childrenStep.bind(this),
                this.numChildrenStep.bind(this),
                this.MaintenainceStep.bind(this),
                this.numMainStep.bind(this),
                this.confirmStep.bind(this),
                this.displayCardStep.bind(this)
               

                
                
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    //ask user for income
    async incomeStep(stepContext) {
        const ApplicationDetails = stepContext.options;
        ApplicationDetails.income= 0;
        if (!ApplicationDetails.income) {
            return await stepContext.prompt(GET_INCOME_PROMPT, 'What is your monthly income after tax?');
        }
        return await stepContext.next(ApplicationDetails.income);
    }
    //yes or no does user have additional income
       async extraIincomeStep(stepContext) {
         const ApplicationDetails = stepContext.options;
          ApplicationDetails.income = stepContext.result;
          ApplicationDetails.extraIncome = 0;
           if (!ApplicationDetails.extraIncome) {
              const messageText = 'Do you have an additional monthly income you would like to add?';
              const msg = MessageFactory.text(messageText, 'Do you have an additional monthly income you would like to add? Enter Yes or No.', InputHints.ExpectingInput);
             
              return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
           }         
         
              return await stepContext.next(ApplicationDetails.extraIncome);
             
            }
            
          //check response and accept user input if any
            async extra(stepContext)
         
            {
                const ApplicationDetails = stepContext.options;
                ApplicationDetails.extraIncome = stepContext.result;
                ApplicationDetails.extra = 0;
                 if (!ApplicationDetails.extra) {

                if( (ApplicationDetails.extraIncome == 'yes'.toUpperCase() )|| (ApplicationDetails.extraIncome == 'yes') ||
                  (ApplicationDetails.extraIncome == 'Yes') || (ApplicationDetails.extraIncome == 'y')  ||
                  (ApplicationDetails.extraIncome == 'y'.toUpperCase()))
            {
    
            
            return await stepContext.prompt(GET_EXTRA_PROMPT, 'Enter additional income');
            }
        
            return await stepContext.next(ApplicationDetails.extra);
        }
    }
    //check for additional monetary commitments
          async commitmentsStep(stepContext) {
            const ApplicationDetails = stepContext.options;
            ApplicationDetails.extra = stepContext.result;
             if (!ApplicationDetails.commitments) {
                if( ( ApplicationDetails.extraIncome == 'yes') || (ApplicationDetails.extraIncome == 'yes'.toUpperCase())){
       
        const messageText = `Do you make any monthly loan repayments?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        // Offer a YES/NO prompt.
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        
    }
    return await stepContext.next(ApplicationDetails.commitments);
          }
    
        }
        //user enters repayments amount
    async repayStep(stepContext) {
        const ApplicationDetails = stepContext.options;
        ApplicationDetails.commitments = stepContext.result;
        ApplicationDetails.repay = 0;
         if (!ApplicationDetails.repay) {
          if( (ApplicationDetails.commitments == 'yes'.toUpperCase() )|| (ApplicationDetails.commitments == 'yes') ||
          (ApplicationDetails.commitments == 'Yes') || (ApplicationDetails.commitments == 'y')  ||
           (ApplicationDetails.commitments == 'y'.toUpperCase())){
                
    return await stepContext.prompt(GET_REPAY_PROMPT,  `Enter your monthly repayments amount`);
    
}
return await stepContext.next(ApplicationDetails.repay);
}
    }
    //does user have any dependants
     async childrenStep(stepContext) {
           const ApplicationDetails = stepContext.options;
            ApplicationDetails.repay = stepContext.result;
           if (!ApplicationDetails.children) {
            const messageText = `Do you have any children or dependants?`;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });  
      }
      return await stepContext.next(ApplicationDetails.children);

     }

     // if dependants, how many?
     async numChildrenStep(stepContext) {
        const ApplicationDetails = stepContext.options;
         ApplicationDetails.children = stepContext.result;
         ApplicationDetails.numChildren = 0;
        if (!ApplicationDetails.numChildren) {
          if( (ApplicationDetails.numChildren == 'yes'.toUpperCase() )|| (ApplicationDetails.numChildren == 'yes') ||
          (ApplicationDetails.numChildren == 'Yes') || (ApplicationDetails.numChildren == 'y')  ||
           (ApplicationDetails.numChildren == 'y'.toUpperCase())){
         return await stepContext.prompt(GET_NUMCHILDREN_PROMPT, `Enter your monthly childcare costs`);  
   }
  
}
// if maintenaince, how much do they pay?
return await stepContext.next(ApplicationDetails.numChildren);
  }
  async MaintenainceStep(stepContext) {
    const ApplicationDetails = stepContext.options;
     ApplicationDetails.numChildren = stepContext.result;
    if (!ApplicationDetails.maintenaince) {
      const messageText = `Do you pay monthly maintenance costs for a child?`;
     const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
     // Offer a YES/NO prompt.
     return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });  
}
return await stepContext.next(ApplicationDetails.maintenaince);



}

async numMainStep(stepContext) {
    const ApplicationDetails = stepContext.options;
     ApplicationDetails.maintenaince = stepContext.result;
     ApplicationDetails.numMain = 0;
    if (!ApplicationDetails.numMain) {
      if( (ApplicationDetails.maintenaince == 'yes'.toUpperCase() )|| (ApplicationDetails.maintenaince == 'yes') ||
      (ApplicationDetails.maintenaince == 'Yes') || (ApplicationDetails.maintenaince == 'y')  ||
       (ApplicationDetails.maintenaince == 'y'.toUpperCase())){

     return await stepContext.prompt(GET_NUMMAIN_PROMPT,  `Enter the monthly amount for maintenaince` );  
}

}

return await stepContext.next(ApplicationDetails.numMain);

}
   //let the user know the loan they are eligible for
      async confirmStep(stepContext) {
       const ApplicationDetails = stepContext.options;

          // Capture the results of the previous step
        ApplicationDetails.numMain = stepContext.result;
        const messageText = `The maxium monthly repayment you could afford is: ${ calcEligibility(`${ApplicationDetails.income}`,`${ApplicationDetails.extra}`,`${ApplicationDetails.repay}`,`${ApplicationDetails.numChildren}`,`${ApplicationDetails.numMain}`)}, would you like an advisor to get in touch?`;
         const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
       // Offer a YES/NO prompt.
       return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        
     }
   //display card to end dialog
     async displayCardStep(stepContext) {
      const ApplicationDetails = stepContext.options;
      
      if (!ApplicationDetails.displayCard) {
    
  if((stepContext.result == true) || (stepContext.result == 'Yes'))
{
  await stepContext.context.sendActivity({
    text: '',
    attachments: [CardFactory.adaptiveCard(cards)]
});
       
}else{
      // Display the Adaptive Card
      return await stepContext.endDialog(ApplicationDialog);
      // Display a Text Prompt

  }
  return await stepContext.next(ApplicationDetails.displayCard);
}


}
  

  





    

      
       }
    
       function calcEligibility(income=0,extra=0,repay=0,numChildren=0, numMain=0)
       {
            
           const loanTerm = 1;
           const divisor = 12.00;
           const APR = .10;
           const totMoney = ((parseInt(income) + parseInt(extra)) - parseInt(repay) - parseInt(numMain) - parseInt(numChildren));
           let mon = totMoney * APR;
           let mon2 = mon * divisor;
           let mon3 = mon2 * 2;
           let mon4 = mon3 /divisor;

           
        
            
         return `${mon4.toFixed(2)}`
           
       }
module.exports.ApplicationDialog = ApplicationDialog;
