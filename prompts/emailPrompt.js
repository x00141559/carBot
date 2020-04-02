const { TextPrompt } = require('botbuilder-dialogs');

module.exports.EmailPrompt = class EmailPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Please tell me your email.');
                return false;
            } else {
                const value = prompt.recognized.value;
                if (value.length < 1) {
                    await prompt.context.sendActivity('Your email has to include at least one character.');
                    return false;
                } else if (value.length > 50) {
                    await prompt.context.sendActivity(`Sorry, but I can only handle emails of up to 50 characters. Yours was ${ value.length }.`);
                    return false;
                } else if (validateEmail(value) == false){
                    await prompt.context.sendActivity(`Sorry, but that is not a valid email address, enter in the format name@name.com`);
                }
                 else {
                    return true;
                }
            }
        
        });
    }
}
function validateEmail(email) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
