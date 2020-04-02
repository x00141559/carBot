const { TextPrompt } = require('botbuilder-dialogs');

module.exports.AmountPrompt = class AmountPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Enter an amount');
                return false;
            } else {
                const value = prompt.recognized.value;
                if ((value < 2000 ) || (value > 50000)) {
                    await prompt.context.sendActivity(`Sorry, but we only offer loans between €5000 and €50,000`);
                    return false;
                }else if (isNaN(value)){
                    await prompt.context.sendActivity(`Please enter a valid number`);
                    return false;
                }
                 else {
                    return true;
                }
            }
        });
    }
}