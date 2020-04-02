const { TextPrompt } = require('botbuilder-dialogs');

module.exports.IncomePrompt = class IncomePrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Please tell me your income.');
                return false;
            } else {
                const value = prompt.recognized.value;
                if ((value < 1000 )) {
                    await prompt.context.sendActivity(`Sorry, but we only accept incomes of €1000 and above`);
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