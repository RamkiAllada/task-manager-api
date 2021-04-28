const sgMail= require('@sendgrid/mail');
const sendGridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);
const sendWelcomeEmail = (email, name) => {
    const message = {
        to: email, // Change to your recipient
        from: 'devnodebasics@mailinator.com', // Change to your verified sender
        subject: 'Thanks for Registering with us!',
        html: `<strong>Hey ${name},
                Thanks for regestering with us!!!</strong>
                <p>You will be receiveing the other mails. Please proceed by sending your details.</p>
                <p>For more queries mail us to <a href = "mailto:${email}">Send Email</a></p>
                <i>Thanks & Regards</i><br/>
                <i>Team nodeBasics.inc</i>`
                ,
      }
    sgMail
    .send(message)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
}
module.exports = {
    sendWelcomeEmail
}
