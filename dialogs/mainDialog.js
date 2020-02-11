// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer, QnAMaker  } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, bookingDialog) {
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

        if (!bookingDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(bookingDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
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

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'What can I help you with today?\nSay something like "Apply for a loan from the bank"';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        const bookingDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            // LUIS is not configured, we just run the BookingDialog path.
            return await stepContext.beginDialog('bookingDialog', bookingDetails);
        }

        // Call LUIS and gather any potential booking details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
        case 'l_GetLoan': {
            // Extract the values for the composite entities from the LUIS result.
            const fromEntities = this.luisRecognizer.getFromEntities(luisResult);
            const forEntities = this.luisRecognizer.getForEntities(luisResult);

            // Show a warning for Origin and Destination if we can't resolve them.
           await this.showWarningForUnsupportedCities(stepContext.context, fromEntities, forEntities);

            // Initialize BookingDetails with any entities we may have found in the response.
            bookingDetails.amount = forEntities.money;
            bookingDetails.lenderType = fromEntities.lender;
            bookingDetails.birthDate = this.luisRecognizer.getBirthDate(luisResult);
            console.log(`${forEntities.money}`);
            console.log('LUIS extracted these booking details:' , JSON.stringify(bookingDetails));

            // Run the BookingDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
            return await stepContext.beginDialog('bookingDialog', bookingDetails);
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
        const unsupportedCities = [];
        if (fromEntities.from && !fromEntities.lender) {
            unsupportedCities.push(fromEntities.from);
        }

        if (forEntities.for && !forEntities.lender) {
            unsupportedCities.push(toEntities.for);
        }

        if (unsupportedCities.length) {
            const messageText = `Sorry but the following fields are not supported: ${ unsupportedCities.join(', ') }`;
            await context.sendActivity(messageText, messageText, InputHints.IgnoringInput);
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const timeProperty = new TimexProperty(result.birthDate);
            const birthDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
            const msg = `Your monthy repayment will be £360 , your lender of choice has an interest rate of 2.99%.`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
    
}

module.exports.MainDialog = MainDialog;
