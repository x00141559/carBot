// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required packages
const path = require('path');
const restify = require('restify');
const { CosmosDbPartitionedStorage } = require("botbuilder-azure");
// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, ConversationState, InputHints, MemoryStorage, UserState } = require('botbuilder');

const { LoanRecognizer } = require('./dialogs/loanRecognizer');


const { DispatchBot } = require('./bots/dispatchBot');

// This bot's main dialog.
const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');

const { MainDialog } = require('./dialogs/mainDialog');
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const mseg = {
//     to: `${loanDetails.email}`,
//     from: 'aoife_80@msn.com',
//     subject: 'Sending with Twilio SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   }
//   sgMail.send(mseg);
// the bot's loan dialog
const { LoanDialog } = require('./dialogs/loanDialog');
const LOAN_DIALOG = 'loanDialog';
const { ApplicationDialog } = require('./dialogs/ApplicationDialog')
const APPLICATION_DIALOG = 'applicationDialog';
var azure = require('botbuilder-azure');
// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    let onTurnErrorMessage = 'The bot encounted an error or bug.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    onTurnErrorMessage = 'To continue to run this bot, please fix the bot source code.';
    await context.sendActivity(onTurnErrorMessage, onTurnErrorMessage, InputHints.ExpectingInput);
    // Clear out state
    await conversationState.delete(context);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
//const memoryStorage = new MemoryStorage();
// initialized to access values in .env file.


// Create local Memory Storage - commented out.
// var storage = new MemoryStorage();
var documentDbOptions = {
    host: 'Your-Azure-DocumentDB-URI', 
    masterKey: 'Your-Azure-DocumentDB-Key', 
    database: 'botdocs',   
    collection: 'botdata'
};
// Create access to CosmosDb Storage - this replaces local Memory Storage.
var storage = new CosmosDbPartitionedStorage({
    cosmosDbEndpoint: process.env.DB_SERVICE_ENDPOINT, 
    authKey: process.env.AUTH_KEY, 
    databaseId: process.env.DATABASE_ID,
    containerId: process.env.CONTAINER
})
const conversationState = new ConversationState(storage);
const userState = new UserState(storage);

// If configured, pass in the LoanRecognizer.  (Defining it externally allows it to be mocked for tests)
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig = { applicationId: LuisAppId, endpointKey: LuisAPIKey, endpoint: `https://${ LuisAPIHostName }` };

const luisRecognizer = new LoanRecognizer(luisConfig);

// Create the main dialog.
const loanDialog = new LoanDialog(LOAN_DIALOG);
const applicationDialog = new ApplicationDialog(APPLICATION_DIALOG);
const dialog = new MainDialog(luisRecognizer, loanDialog, applicationDialog);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

// Create the main dialog.
const dispatcher = new DispatchBot();
// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});