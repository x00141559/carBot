
var validator = require('validator');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
module.exports.Email = class Email extends TextPrompt {
    constructor(dialogId) {
const mseg = {
    to: 'aoife_80@msn.com',
    from: 'aoife_80@msn.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

}
}

