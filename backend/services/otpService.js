const tls = require('tls');
const https = require('https');

// Pure Node.js SMTP email sender (zero dependencies!)
const sendEmail = ({ to, subject, html, text }) => {
  return new Promise((resolve, reject) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.EMAIL_PORT || '465');

    // If SMTP credentials are not configured, print to console gracefully for development/testing
    if (!emailUser || !emailPass) {
      console.log(`\n==================================================`);
      console.log(`⚠️  [SMTP-SERVICE] Warning: EMAIL_USER and/or EMAIL_PASS environment variables are not configured.`);
      console.log(`✉️  [SMTP-SERVICE] MOCK EMAIL OTP DELIVERED SUCCESSFULLY`);
      console.log(`✉️  [SMTP-SERVICE] Recipient: "${to}"`);
      console.log(`✉️  [SMTP-SERVICE] Subject: "${subject}"`);
      console.log(`✉️  [SMTP-SERVICE] Body:\n${text || html.replace(/<[^>]*>/g, '')}`);
      console.log(`==================================================\n`);
      return resolve({ mock: true });
    }

    console.log(`📧 [SMTP-SERVICE] Connecting to secure SMTP server ${smtpHost}:${smtpPort}...`);

    let socket;
    try {
      socket = tls.connect({
        host: smtpHost,
        port: smtpPort,
        rejectUnauthorized: false
      }, () => {
        console.log('✓ [SMTP-SERVICE] Secured TLS connection established.');
      });
    } catch (err) {
      return reject(err);
    }

    let responseStep = 0;
    let accumulatedData = '';

    socket.on('data', (data) => {
      const response = data.toString();
      accumulatedData += response;
      
      const lines = response.split('\n');
      const lastLine = lines[lines.length - 2] || response;
      const code = lastLine.substring(0, 3);

      try {
        if (responseStep === 0) {
          socket.write('EHLO localhost\r\n');
          responseStep = 1;
        } else if (responseStep === 1) {
          socket.write('AUTH LOGIN\r\n');
          responseStep = 2;
        } else if (responseStep === 2) {
          const base64User = Buffer.from(emailUser).toString('base64');
          socket.write(base64User + '\r\n');
          responseStep = 3;
        } else if (responseStep === 3) {
          const base64Pass = Buffer.from(emailPass).toString('base64');
          socket.write(base64Pass + '\r\n');
          responseStep = 4;
        } else if (responseStep === 4) {
          if (code === '235') {
            socket.write(`MAIL FROM:<${emailUser}>\r\n`);
            responseStep = 5;
          } else {
            throw new Error(`Authentication failed: ${response}`);
          }
        } else if (responseStep === 5) {
          socket.write(`RCPT TO:<${to}>\r\n`);
          responseStep = 6;
        } else if (responseStep === 6) {
          socket.write('DATA\r\n');
          responseStep = 7;
        } else if (responseStep === 7) {
          const mailContent = 
            `From: "Shri Navrang Jewellers" <${emailUser}>\r\n` +
            `To: <${to}>\r\n` +
            `Subject: ${subject}\r\n` +
            `MIME-Version: 1.0\r\n` +
            `Content-Type: text/html; charset=utf-8\r\n` +
            `\r\n` +
            `${html}\r\n` +
            `.\r\n`;
          socket.write(mailContent);
          responseStep = 8;
        } else if (responseStep === 8) {
          socket.write('QUIT\r\n');
          responseStep = 9;
        } else if (responseStep === 9) {
          socket.end();
          console.log('✓ [SMTP-SERVICE] Email sent successfully and socket closed.');
          resolve({ success: true });
        }
      } catch (err) {
        socket.destroy();
        console.error('❌ [SMTP-SERVICE] SMTP connection error:', err.message);
        reject(err);
      }
    });

    socket.on('error', (err) => {
      console.error('❌ [SMTP-SERVICE] Socket error:', err.message);
      reject(err);
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP Socket timeout'));
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
