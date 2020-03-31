// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory,ActivityTypes} = require('botbuilder');
const { ConfirmPrompt, TextPrompt, NumberPrompt, WaterfallDialog,ChoiceFactory,ChoicePrompt } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CHOICE_PROMPT = 'choicePrompt';
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const NUMBER_PROMPT = 'numberPrompt';


class ApplicationDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'applicationDialog');
        
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new NumberPrompt(NUMBER_PROMPT))
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
                this.confirmStep.bind(this)
                
                
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    async incomeStep(stepContext) {
        const ApplicationDetails = stepContext.options;
    
        if (!ApplicationDetails.income) {
            const messageText = 'What is your monthly income after tax?';
            const msg = MessageFactory.text(messageText, 'What is your monthly income after tax?', InputHints.ExpectingInput);
            return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });
        }
        return await stepContext.next(ApplicationDetails.income);
    }
       async extraIincomeStep(stepContext) {
         const ApplicationDetails = stepContext.options;
          ApplicationDetails.income = stepContext.result;
           if (!ApplicationDetails.extraIncome) {
              const messageText = 'Do you have an additional monthly income you would like to add?';
              const msg = MessageFactory.text(messageText, 'Do you have an additional monthly income you would like to add?', InputHints.ExpectingInput);
             
              return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
           }          
              return await stepContext.next(ApplicationDetails.extraIncome);
           
       
         
            }
            

            async extra(stepContext)
         
            {
                const ApplicationDetails = stepContext.options;
                ApplicationDetails.extraIncome = stepContext.result;
                 if (!ApplicationDetails.extra) {
                if(   ApplicationDetails.extraIncome == 'yes')
            {
             const messageText = 'Enter additional income';
             const msg = MessageFactory.text(messageText, 'Enter additional income', InputHints.ExpectingInput);
            
            return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });
            }
        
            return await stepContext.next(ApplicationDetails.extra);
        }
    }
          async commitmentsStep(stepContext) {
            const ApplicationDetails = stepContext.options;
            ApplicationDetails.extra = stepContext.result;
             if (!ApplicationDetails.commitments) {
                if(   ApplicationDetails.extraIncome == 'yes'){
       
        const messageText = `Do you make any monthly loan repayments?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        // Offer a YES/NO prompt.
        return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        
    }
    return await stepContext.next(ApplicationDetails.commitments);
          }
    
        }
    async repayStep(stepContext) {
        const ApplicationDetails = stepContext.options;
        ApplicationDetails.commitments = stepContext.result;
        ApplicationDetails.repay = 0;
         if (!ApplicationDetails.repay) {
            if(   ApplicationDetails.commitments == 'yes'){
                
    const messageText = `Enter your monthly repayments amount`;
    const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
    // Offer a YES/NO prompt.
    return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });
    
}
return await stepContext.next(ApplicationDetails.repay);
}
    }
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

     async numChildrenStep(stepContext) {
        const ApplicationDetails = stepContext.options;
         ApplicationDetails.children = stepContext.result;
        if (!ApplicationDetails.numChildren) {
           if(ApplicationDetails.children == 'yes'){
         const messageText = `Enter the monthly amount for childcare`;
         const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
         // Offer a YES/NO prompt.
         return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });  
   }
   return await stepContext.next(ApplicationDetails.numChildren);
}
  

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
    if (!ApplicationDetails.numMain) {
       if(ApplicationDetails.maintenaince == 'yes'){
     const messageText = `Enter the monthly amount for maintenaince`;
     const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
     // Offer a YES/NO prompt.
     return await stepContext.prompt(NUMBER_PROMPT, { prompt: msg });  
}
return await stepContext.next(ApplicationDetails.numMain);
}



}
    // async termStep(stepContext) {
    //     const loanDetails = stepContext.options;
    //     loanDetails.amount = stepContext.result;
    //     if (!loanDetails.term) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.
        // return await stepContext.prompt(CHOICE_PROMPT, {
        //     prompt: 'Please enter your loan term in years.',
        //     choices: ChoiceFactory.toChoices(['1', '2', '3','4','5','6'])
    //     const messageText = 'How long would you like the term (1-6)';
    //     const msg = MessageFactory.text(messageText, 'How long would you like the term (1-6)', InputHints.ExpectingInput);
    //     return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
    
    // }

    // return await stepContext.next(loanDetails.term);
    // }

    // /**
    //  * If an origin city has not been provided, prompt for one.
    //  */
    // async lenderTypeStep(stepContext) {
    //     const loanDetails = stepContext.options;

  
    // /**
    //  * If a travel date has not been provided, prompt for one.
    //  * This will use the DATE_RESOLVER_DIALOG.
    //  */
    // async birthDateStep(stepContext) {
    //     const loanDetails = stepContext.options;

    //     // Capture the results of the previous step
    //     loanDetails.lenderType = stepContext.result;
    //     if (!loanDetails.birthDate || this.isAmbiguous(loanDetails.birthDate)) {
    //         return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: loanDetails.birthDate });
    //     }
    //     return await stepContext.next(loanDetails.birthDate);
    // }

    // /**
    //  * Confirm the information the user has provided.
    //  */
      async confirmStep(stepContext) {
       const ApplicationDetails = stepContext.options;

          // Capture the results of the previous step
        ApplicationDetails.numMain = stepContext.result;
        const messageText = `The maxium monthly repayment you could afford is: ${ calcEligibility(`${ApplicationDetails.income}`,`${ApplicationDetails.extra}`,`${ApplicationDetails.repay}`,`${ApplicationDetails.numChildren}`)}, would you like an advisor to get in touch?`;
         const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
       // Offer a YES/NO prompt.
       return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        
     }
   

    // /**
    //  * Complete the interaction and end the dialog.
    //  */
    // async finalStep(stepContext) {
 
    //     if (stepContext.result === true) {
    //         const loanDetails = stepContext.options;
            
    //         console.log("end");




           // const messageText = `Your Monthly payment would be: ${calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`)} , do you wish to have an advisor contact you in relation to this quote? `;
         //   const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            //return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
           
            //return await stepContext.endDialog(loanDetails);
      //  }
      //  if (stepContext.msg ==  'yes'.toLocaleUpperCase())
       // {
           // email = this.email;
       // }
      //  return await stepContext.endDialog( applicationDialog);
//     }

//     isAmbiguous(timex) {
//         const timexPropery = new TimexProperty(timex);
//         return !timexPropery.types.has('definite');
//     }
    
   
// }




      //    }
    

      
       }
    
       function calcEligibility(income=0,extra=0,repay=0,numChildren=0, numMain=0)
       {
         
           const loanTerm = 1;
           const divisor = 12.00;
           const APR = .10;
           console.log('hi',`${income}`);
           console.log('repay',`${repay}`);
           console.log('numChildren',`${numChildren}`);
           console.log('numMain',`${numMain}`);
           console.log('numMain',`${extra}`);
           const totMoney = ((income + extra) - repay );
           console.log('totMoney',`${totMoney}`);
           let mon = totMoney * APR;
           let mon2 = mon * divisor;
           let mon3 = mon2 * 2;
           let mon4 = mon3 /divisor;

           
        
            
         return `${mon4.toFixed(2)}`
           
       }
module.exports.ApplicationDialog = ApplicationDialog;
