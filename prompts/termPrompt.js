const { TextPrompt } = require('botbuilder-dialogs');

module.exports.TermPrompt = class TermPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Please enter a term amount from 1 - 6');
                return false;
            } else {
                const value = prompt.recognized.value;
                if ((value <1) || (value >6)) {
                    await prompt.context.sendActivity('We can only accept terms between 1 and 6');
                    return false;
                }else if (isNaN(value)){
                    await prompt.context.sendActivity(`Please enter a valid number`);
                    return false;
                
                } else {
                    return true;
                }
            }
        });
    }
}