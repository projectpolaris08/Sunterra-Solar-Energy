import nodemailer from "nodemailer";

// Vercel serverless function handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { name, email, phone, propertyType, systemType, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !propertyType || !systemType) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipientEmail =
      process.env.RECIPIENT_EMAIL || "info@sunterrasolarenergy.com";

    if (!smtpPassword) {
      console.error("SMTP_PASSWORD is not set in environment variables");
      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured. Please contact the administrator.",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Sunterra Solar Website" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact Form Submission - ${propertyType} ${systemType} System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Project Details</h3>
            <p><strong>Property Type:</strong> ${propertyType}</p>
            <p><strong>System Interest:</strong> ${systemType}</p>
          </div>

          ${
            message
              ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          `
              : ""
          }

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the Sunterra Solar Energy website contact form.</p>
            <p>You can reply directly to this email to contact ${name} at ${email}.</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Project Details:
- Property Type: ${propertyType}
- System Interest: ${systemType}

${message ? `Message:\n${message}\n` : ""}

---
This email was sent from the Sunterra Solar Energy website contact form.
You can reply directly to this email to contact ${name} at ${email}.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully. We'll contact you within 24 hours.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message:
        "Failed to send email. Please try again later or contact us directly.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
