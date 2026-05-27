const nodemailer = require('nodemailer');
const https = require('https');

// Nodemailer SMTP email sender
const sendEmail = ({ to, subject, html, text }) => {
  return new Promise((resolve, reject) => {
    const emailUser = process.env.EMAIL_USER || 'gbkdn557icmumbl7@ethereal.email';
    const emailPass = process.env.EMAIL_PASS || 'GTfMwFdQtSCSEW26ky';
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.ethereal.email';
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');

    // Reject immediately if SMTP credentials are not configured
    if (!emailUser || !emailPass) {
      const errorMsg = 'SMTP credentials are not configured. Please check EMAIL_USER and EMAIL_PASS.';
      console.error(`❌ [SMTP-SERVICE] ${errorMsg}`);
      return reject(new Error(errorMsg));
    }

    console.log(`📧 [SMTP-SERVICE] Connecting to secure SMTP server ${smtpHost}:${smtpPort} as ${emailUser}...`);

    // Create transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false // avoid self-signed certificate issues in local/prod servers
      }
    });

    const mailOptions = {
      from: `"Shri Navrang Jewellers" <${emailUser}>`,
      to,
      subject,
      text,
      html
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ [SMTP-SERVICE] Nodemailer sendMail error:', err.message);
        return reject(err);
      }
      console.log('✓ [SMTP-SERVICE] Email sent successfully via Nodemailer:', info.messageId);
      resolve({ success: true, messageId: info.messageId });
    });
  });
};

// Pure Node.js SMS sender integration (zero dependencies!)
const sendSMS = ({ to, message }) => {
  return new Promise((resolve) => {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioAuth || !twilioFrom) {
      console.log(`\n==================================================`);
      console.log(`⚠️  [SMS-SERVICE] Warning: Twilio SMS configuration environment variables are missing.`);
      console.log(`💬  [SMS-SERVICE] MOCK MOBILE SMS OTP DELIVERED SUCCESSFULLY`);
      console.log(`💬  [SMS-SERVICE] Recipient: "${to}"`);
      console.log(`💬  [SMS-SERVICE] Message: "${message}"`);
      console.log(`ℹ️  [SMS-SERVICE] SMS SETUP INSTRUCTIONS:`);
      console.log(`    To enable real SMS delivery, configure the following inside backend/.env:`);
      console.log(`    TWILIO_ACCOUNT_SID=your_twilio_sid`);
      console.log(`    TWILIO_AUTH_TOKEN=your_twilio_auth_token`);
      console.log(`    TWILIO_PHONE_NUMBER=your_twilio_phone_number`);
      console.log(`==================================================\n`);
      return resolve({ mock: true });
    }

    console.log(`💬 [SMS-SERVICE] Dispatching Twilio SMS to ${to}...`);
    
    const postData = new URLSearchParams({
      To: to.startsWith('+') ? to : `+91${to}`,
      From: twilioFrom,
      Body: message
    }).toString();

    const authHeader = 'Basic ' + Buffer.from(twilioSid + ':' + twilioAuth).toString('base64');
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✓ [SMS-SERVICE] Twilio SMS dispatched successfully!');
          resolve({ success: true, response: JSON.parse(body) });
        } else {
          console.error('❌ [SMS-SERVICE] Twilio API error response:', body);
          resolve({ success: false, error: body });
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ [SMS-SERVICE] Twilio network error:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
};

module.exports = {
  sendEmail,
  sendSMS,
};
