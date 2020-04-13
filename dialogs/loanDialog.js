// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { NamePrompt } = require('../prompts/namePrompt');
const { EmailPrompt } = require('../prompts/emailPrompt');
const { AmountPrompt } = require('../prompts/amountPrompt');
// Import AdaptiveCard content.
const BoiCard = require('./resources/boi.json');
const BamlCard = require('./resources/baml.json');
const CreditCard = require('./resources/creditUnion.json');

const { TermPrompt } = require('../prompts/termPrompt');

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory,  CardFactory} = require('botbuilder');
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
const Rates = require('./resources/rates');



  // Create array of AdaptiveCard content, this will be used to send a random card to the user.
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
        await stepContext.context.sendActivity({
            text: 'The most current rates:',
            attachments: [CardFactory.adaptiveCard(Rates)],
    });
        // Display a Text Prompt
        return await stepContext.prompt('textPrompt', 'do they look good for you?');
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
console.log('result',stepContext.result);
        //     if(`${loanDetails.reward}` ==  1)
        // {
        //     loanDetails.reward = 'silver'
        // }
        //  if (`${loanDetails.reward}`  == 2)
        // {
        //     loanDetails.reward  = 'gold'
        // }
        // else if (`${loanDetails.reward}` == 3)
        // {
        //     loanDetails.reward  = 'honours'
        // }
        // else 
        // {
        //     loanDetails.reward = 'none'
        // }
        
                return await stepContext.next(loanDetails.reward);
            }
    async termStep(stepContext) {
        const loanDetails = stepContext.options;
        loanDetails.reward = stepContext.result.value;
        if (!loanDetails.term) {
       return await stepContext.prompt(GET_TERM_PROMPT, 'How long would you like the term in years (1-6)');
    
    }

    return await stepContext.next(loanDetails.term);
    }

    
  

    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async birthDateStep(stepContext) {
        const loanDetails = stepContext.options;

        // Capture the results of the previous step
        loanDetails.term = stepContext.result;
        if (!loanDetails.birthDate || this.isAmbiguous(loanDetails.birthDate)) {
            
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: loanDetails.birthDate });
            
        }
       
        

      //  return await stepContext.next(loanDetails.birthDate);
        if (calculateAge(`${loanDetails.birthDate}`) < 18)
        {
            const messageText = `Sorry, you must be older than 18 to apply for a loan with us`;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
           // return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
         
        }
        return await stepContext.next(loanDetails.birthDate);
    }
    
    async lenderStep( stepContext){
        
        const loanDetails = stepContext.options;
        loanDetails.birthDate = stepContext.result;
  //      console.log(calculateAge(`${loanDetails.birthDate}`));
        if (!loanDetails.APR) {
        //this.onMessage(async (context, next) => {
            let card;
            if (calculateAge(`${loanDetails.birthDate}`) < 18)
            {
                const messageText = `Sorry, you must be older than 18 to apply for a loan with us`;
                const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
                // Offer a YES/NO prompt.
               // return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
             
            }
            if(`${ loanDetails.amount}`  <=3000)
            {
                card = CreditCard;
                loanDetails.APR = .10;

            }
            else if (`${ loanDetails.amount}` <=5000)
            {
                card = BoiCard;
                loanDetails.APR =  .20;
            }
            else
            {
                card = BamlCard;
                loanDetails.APR = .45;
            }
           // const randomlySelectedCard = CARDS[Math.floor((Math.random() * CARDS.length - 1) + 1)];
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
        if (`${ loanDetails.lenderType }` == 1 )
        {
            loanDetails.lenderType = 'Bank of Ireland'
        }
        else if (`${ loanDetails.lenderType }` == 2 )
        {
            loanDetails.lenderType = 'Credit Union'
        }
        else{
            loanDetails.lenderType = 'Bank of America'
        }
        const messageText = `Please confirm, I have you a loan for ${ loanDetails.amount} from: ${ loanDetails.lenderType } your birth date is: ${ loanDetails.birthDate } and you have a reward membership of 
        ${loanDetails.reward}. Is this correct?`;
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
        if ((stepContext.result === false ) || (stepContext.result === 'undefined' ))
        {
            const messageText = `Okay, refresh, let's start again`;
            return false;
        }
        else if(stepContext.result === true) {
            const loanDetails = stepContext.options;
            loanDetails.choice = stepContext.result;
          //  console.log(`${loanDetails.APR}`);
            console.log(calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`,`${loanDetails.APR}`,`${loanDetails.reward}`));

            
                 
             


            const messageText = `Your Monthly payment would be: ${calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`, `${loanDetails.APR}`,`${loanDetails.reward}`)} , an email with quote details has been sent, do you wish to check you eligibility for a loan? `;
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    
            //return await stepContext.endDialog(loanDetails);
        }
     //   sendMail(`${loanDetails.email}`);
        const quote = `${calcLoanAmount(`${loanDetails.term}`,`${loanDetails.amount}`, `${loanDetails.APR}`)}`;
        //console.log(quote);
        // const value = prompt.recognized.value;
        
        // if (value == 'Yes')
        // {
        //     return await stepContext.endDialog(loanDetails);
        // }
        
    
    }
    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
    
   
}



function calcLoanAmount(loanTerm,loanAmount,rate,rewardl)
{
    try{
   // https://www.ifsautoloans.com/blog/car-loan-interest/
   let discount;
   if(rewardl == 'silver')
   {
       discount = .5
   }
    if (rewardl ==  'gold')
   {
       discount = .10
   }
   else if (rewardl ==  'honours')
   {
       discount = .15
   }
   else 
   {
       discount = 0
   }
    const divisor = 12.00;
    
    const interestRate = rate/divisor;
    console.log('discount',discount);
    let middle = 1 + (interestRate);
 
    let term =loanTerm*divisor;
    console.log('term',term)
    let top = interestRate* loanAmount;
    let bottom = (1-(middle)**(-term));
    let monthlyRepayment1 = top/bottom;
        console.log(middle);
        console.log(bottom);
       
        
        let discountcalc = monthlyRepayment1 * discount;
        console.log('reward func ',rewardl);
        console.log('discountcalc',discountcalc);
        console.log('monthly repayment', monthlyRepayment1);
        let monthlyRepayment = monthlyRepayment1 - discountcalc;

  return `${monthlyRepayment.toFixed(2)}`
    }catch (error) {

        //Pass to callback if provided
        if (cb) {
          // eslint-disable-next-line callback-return
          cb(error, null);
        }
  
        //Reject promise
        return Promise.reject(error);
      }
  
}
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
function sendMail(email,term,amount,APR,rate){


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
///console.log(LoanDialog.loanDetails.email);
try{
        const mseg = {
           
            to: `${LoanDialog.email}`,
            from: 'aoife_80@msn.com',
            subject: 'Sending with Twilio SendGrid is Fun',
            text: `Your quote is:, ${calcLoanAmount(`${LoanDialog.term}`,`${LoanDialog.amount}`,`${LoanDialog.APR}`,`${LoanDialog.reward}`)}`, 
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                };
                sgMail.send(mseg);
            
            }catch (error) {

                    //Pass to callback if provided
                    if (cb) {
                      // eslint-disable-next-line callback-return
                      cb(error, null);
                    }
              
                    //Reject promise
                    return Promise.reject(error);
                  }
               
            
        }
    
     
            
module.exports.calcLoanAmount = calcLoanAmount;
module.exports.sendMail = sendMail;
module.exports.LoanDialog = LoanDialog;
