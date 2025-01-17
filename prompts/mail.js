const Loan = require('../dialogs/loanDialog');
module.exports.Mail = function sendEmail() {


    const Calc = require('./email.js');
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try{
            const mseg = {
                to: 'aoife_80@msn.com',
                from: 'aoife_80@msn.com',
                subject: 'Sending with Twilio SendGrid is Fun',
                text: `Your quote is:, ${Calc(`${Loan.term}`,`${Loan.amount}`,`${Loan.APR}`,`${Loan.reward}`)}`, 
                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                    };
                    sgMail.send(mseg);
    
                 }catch (error) {

                    //Pass to callback if provided
                    if (cb) {
                      // eslint-disable-next-line callback-return
                      cb(error, null);
                    }
              
                    //Reject promise
                    return Promise.reject(error);
                  }
               //Use callback function with params

                }