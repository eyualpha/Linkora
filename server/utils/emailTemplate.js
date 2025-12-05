const emailTemplate = (subject, otp) => `
  <div style="background-color:#f4f4f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#6C63FF;padding:20px;text-align:center;color:white;">
        <h1 style="margin:0;font-size:24px;">Linkora</h1>
        <p style="margin:5px 0 0;font-size:14px;">Your Social Space, Connected</p>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h2 style="text-align:center;color:#333;margin-bottom:20px;">${subject}</h2>

        <p style="font-size:16px;color:#555;line-height:1.7;">
          Hello,
          <br/><br/>
          Your verification code is:
        </p>

        <div style="text-align:center;margin:25px 0;">
          <div style="display:inline-block;padding:15px 25px;background:#6C63FF;color:white;
                      font-size:28px;font-weight:bold;border-radius:8px;letter-spacing:3px;">
            ${otp}
          </div>
        </div>

        <p style="font-size:15px;color:#555;line-height:1.7;">
          This code is valid for <strong>10 minutes</strong>.  
          If you didn’t request this, please ignore this email.
        </p>

        <p style="font-size:15px;color:#555;margin-top:25px;">
          Best regards,<br/>
          <strong>Linkora Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f0f0f0;padding:15px;text-align:center;color:#888;font-size:12px;">
        © ${new Date().getFullYear()} Linkora. All rights reserved.
      </div>

    </div>
  </div>
  `;

module.exports = { emailTemplate };
