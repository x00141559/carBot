const { TextPrompt } = require('botbuilder-dialogs');

module.exports.NumChildrenPrompt = class NumChildrenPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Enter your monthly childcare costs.');
                return false;
            } else {
                const value = prompt.recognized.value;
                if ((value < 0 )) {
                    await prompt.context.sendActivity(`Sorry,must be greater than 0`);
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