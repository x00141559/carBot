const { TextPrompt } = require('botbuilder-dialogs');

module.exports.BirthDatePrompt = class BirthDatePrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
           let age = 0;
           let message = null;
           var results = NumberRecognizer.RecognizeNumber(input, Culture.English)
              foreach (var result in results)
        {
            // The result resolution is a dictionary, where the "value" entry contains the processed string.
            if (result.Resolution.TryGetValue("value", out var value))
            {
                age = Convert.ToInt32(value);
                if (age >= 18 && age <= 120)
                {
                    return true;
                }
            }
        }
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Enter your birth date.');
                return false;
            } else {
               // let value = prompt.recognized.value;
                value = getAge(value);

                if (value < 18) {
                    await prompt.context.sendActivity(`Sorry, you must be older than 18 to apply for a loan with us`);
                    return false;
                }
                 else {
                    return true;
                }
            }
        });
    }
}

fn ValidateAge(string input, out int age, out string message)
{
    age = 0;
    message = null;

    // Try to recognize the input as a number. This works for responses such as "twelve" as well as "12".
    try
    {
        // Attempt to convert the Recognizer result to an integer. This works for "a dozen", "twelve", "12", and so on.
        // The recognizer returns a list of potential recognition results, if any.

        var results = NumberRecognizer.RecognizeNumber(input, Culture.English);

        foreach (var result in results)
        {
            // The result resolution is a dictionary, where the "value" entry contains the processed string.
            if (result.Resolution.TryGetValue("value", out var value))
            {
                age = Convert.ToInt32(value);
                if (age >= 18 && age <= 120)
                {
                    return true;
                }
            }
        }

        message = "Please enter an age between 18 and 120.";
    }
    catch
    {
        message = "I'm sorry, I could not interpret that as an age. Please enter an age between 18 and 120.";
    }

    return message is null;
}
