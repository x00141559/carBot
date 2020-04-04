// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const FORM_PROMPT ='TextPrompt';
const InputCard = require('./resources/inputCard.json');
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints, CardFactory } = require('botbuilder');
const { LuisRecognizer, QnAMaker  } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, loanDialog, ApplicationDialog) {
        super('MainDialog');

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!loanDialog) throw new Error('[MainDialog]: Missing parameter \'loanDialog\' is required');

        // Define the main dialog and its related components.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new TextPrompt('AdaptiveCardPrompt'))
            .addDialog(loanDialog)
            .addDialog(ApplicationDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
               // this.promptCardStep.bind(this),
                this.actStep.bind(this),
                this.applyStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
     
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
            // The following check looks for a non-existant text input
        // plus Adaptive Card input in _activity.value.text
        // If both conditions exist, the Activity Card text
        // is copied into the text input field.
        // if(turnContext._activity.text == null
        //     && turnContext._activity.value.text != null) {
        //     this.logger.log('replacing null text with Activity Card text input');
        //     turnContext._activity.text = turnContext._activity.value.text;
        // }
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
           
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a loan request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
           
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await next();
        }
      
        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg :   ' Hello';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
       
    }
    //         /* One step in a Waterfall Dialog. */
    //     async promptCardStep(stepContext) {
    //         // A form with a few Input.text fields.
    //         const card = CardFactory.adaptiveCard(InputCard);
    //         // Step 1: Send the form to the user.
    //        await stepContext.context.sendActivity({
    //        attachments: [card]
    //         });
    //        console.log(stepContext.activity.text);
    //         // Step 2: (Text) Prompt user to complete the form.
    //       //  return stepContext.prompt(FORM_PROMPT);
    //       return await stepContext.beginDialog('loanDialog', loanDetails);
    //   }
  
    // async cardStep (stepContext) {
    //     if (stepContext.activity.type == ActivityTypes.Message) {
    //         console.log("ActivityTypes.Message");
    //       // Ensure that message is a postBack (like a submission from Adaptive Cards)
    //       if (stepContext.activity.channelData != null) {
    //         if (stepContext.activity.channelData.postBack === true) {
    //           const postbackActivity = stepContext.activity;
    //           // Convert the user's Adaptive Card input into the input of a Text Prompt
    //           // Must be sent as a string
    //           postbackActivity.text = JSON.stringify(postbackActivity.value);
    //           // context.activity.text = postbackActivity.value
    //           await context.sendActivity(postbackActivity);
    //           console.log(postbackActivity);
    //         }
    //       }
    //     }
    //     await next();
    //   }
    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the loanDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        const loanDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            // LUIS is not configured, we just run the loanDialog path.
            return await stepContext.beginDialog('loanDialog', loanDetails);
        }

        // Call LUIS and gather any potential loan details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'l_GetLoan': {
            // Extract the values for the composite entities from the LUIS result.
            const fromEntities = this.luisRecognizer.getFromEntities(luisResult);
            const forEntities = this.luisRecognizer.getForEntities(luisResult);

            // Show a warning for lender and amount if we can't resolve them.
           await this.showWarningForUnsupportedCities(stepContext.context, fromEntities, forEntities);

            // Initialize loanDetails with any entities we may have found in the response.
            loanDetails.amount = forEntities.money;
            loanDetails.lenderType = fromEntities.lender;
            loanDetails.birthDate = this.luisRecognizer.getBirthDate(luisResult);
            console.log(`${forEntities.money}`);
            console.log('LUIS extracted these loan details:' , JSON.stringify(loanDetails));

            // Run the loanDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
            return await stepContext.beginDialog('loanDialog', loanDetails);
        }

        case 'q_sample-qna': {
            await this.processAutoQnA(stepContext.context);
            break;
           
        }

        default: {
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }

        return await stepContext.next();
    }

   
    async processAutoQnA(context) {
        console.log('processAutoQnA');
    
        const results = await this.qnaMaker.getAnswers(context);
    
        if (results.length > 0) {
            await context.sendActivity(`${ results[0].answer }`);
        } else {
            await context.sendActivity('Sorry, could not find an answer in the Q and A system.');
        }
    }
    
    /**
     * Shows a warning if the requested From or To cities are recognized as entities but they are not in the Airport entity list.
     * In some cases LUIS will recognize the From and To composite entities as a valid cities but the From and To Airport values
     * will be empty if those entity values can't be mapped to a canonical item in the Airport.
     */ 
    async showWarningForUnsupportedCities(context, fromEntities, forEntities) {
        const unsupportedFrom = [];
        if (fromEntities.from && !fromEntities.lender) {
            unsupportedFrom.push(fromEntities.from);
        }
        const unsupportedFor= [];
        if (forEntities.for && !forEntities.lender) {
            unsupportedFor.push(toEntities.for);
        }

        if (unsupportedFrom.length) {
            const messageText = `Sorry but the following fields are not supported: ${ unsupportedFrom.join(', ') }`;
            await context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
        }
       
    }
    async applyStep(stepContext) {
        const ApplicationDetails = {};
     
        if (stepContext.result === true) {
         
            // LUIS is not configured, we just run the loanDialog path.
            return await stepContext.beginDialog('applicationDialog', ApplicationDetails);
        }else{
             // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("loanDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the loan details.

            // This is where calls to the loan AOU service or database would go.

            // If the call to the loan service was successful tell the user.
            const timeProperty = new TimexProperty(result.birthDate);
           const birthDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
           const msg = ``;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
    
}
function wait(ms)
{
var d = new Date();
var d2 = null;
do { d2 = new Date(); }
while(d2-d < ms);
}

module.exports.MainDialog = MainDialog;
