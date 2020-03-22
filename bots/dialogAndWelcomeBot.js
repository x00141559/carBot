// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { CardFactory } = require('botbuilder');
const { DialogBot } = require('./dialogBot');
const WelcomeCard = require('./resources/welcomeCard.json');
const InputCard = require('./resources/inputCard.json');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);
     
        
       this.onMembersAdded(async (context, next) => {
           const membersAdded = context.activity.membersAdded;
           for (let cnt = 0; cnt < membersAdded.length; cnt++) {
               if (membersAdded[cnt].id !== context.activity.recipient.id) {
                   const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                   const inputCard = CardFactory.adaptiveCard(WelcomeCard);
                   await context.sendActivity({ attachments: [ welcomeCard] });
                   await dialog.run(context, conversationState.createProperty('DialogState'));
               }
           }

            // By calling next() you ensure that the next BotHandler is run.
           await next();
       });
        // this.onMembersAdded(async (context, next) => {
        //     const membersAdded = context.activity.membersAdded;
        //     for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        //         if (membersAdded[cnt].id !== context.activity.recipient.id) {
        //             const inputCard = CardFactory.adaptiveCard(InputCard);
        //             await context.sendActivity({ attachments: [inputCard] });
        //             await dialog.run(context, conversationState.createProperty('DialogState'));
        //         }
        //     }
                
        // });
    
    
    }
   
   
}




module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
