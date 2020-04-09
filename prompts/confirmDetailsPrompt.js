// const { TextPrompt } = require('botbuilder-dialogs');
// //import loanDetails from '../dialogs/LoanDialog';
// import { LoanDialog } from '../dialogs/loanDialog';
// module.exports.ConfirmDetailsPrompt = class ConfirmDetailsPrompt extends TextPrompt {
//     constructor(dialogId) {
//         super(dialogId, async (prompt) => {
//             if (!prompt.recognized.succeeded) {
//                 await prompt.context.sendActivity( `Please confirm, I have you a loan for ${ LoanDialog.loanDetails.amount} from: ${ LoanDialog.loanDetails.lenderType } your birth date is: ${ LoanDialog.loanDetails.birthDate }. Is this correct?`;;
//                 return false;
//             } else {
//                 const value = prompt.recognized.value;
//                 if ((value <) || (value >6)) {
//                     await prompt.context.sendActivity('We can only accept terms between 1 and 6');
//                     return false;
//                 }else if (isNaN(value)){
//                     await prompt.context.sendActivity(`Please enter a valid number`);
//                     return false;
                
//                 } else {
//                     return true;
//                 }
//             }
//         });
//     }
// }