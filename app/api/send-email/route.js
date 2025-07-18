import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
console.log("API KEY present?", !!process.env.SENDGRID_API_KEY);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

export async function POST(request) {
  try {
    const { to, firstName, status, type } = await request.json();

    if (!to) {
      return new Response("Recipient email is required", { status: 400 });
    }

    let msg;

    if (type === "status_update") {
      let statusMessage = "";

      if (status === "Verified") {
        statusMessage = `
          <p>Congratulations! Your operator account has been verified. You now have full access to the SAKE system.</p>
          <p>You can log in and start managing your operations.</p>
          <div style="margin: 20px 0;">
            <a href="https://operator-vert-alpha.vercel.app/login/" 
               style="display: inline-block; background-color:rgb(40, 55, 167); color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Log in to your account
            </a>
          </div>
          <p>Thank you for being part of SAKE!</p>
        `;
      } else if (status === "Suspended") {
        statusMessage = `
          <p>We regret to inform you that your operator account has been suspended.</p>
          <p>If you believe this is an error or wish to appeal, please contact our support team for further assistance.</p>
          <p>We appreciate your understanding.</p>
        `;
      } else {
        statusMessage = `<p>Your account status has been updated to: <strong>${status}</strong>.</p>`;
      }

      msg = {
        to,
        from: process.env.EMAIL_FROM,
        replyTo: "sakeccsfp24@gmail.com",
        bcc: "ccsfpsake@gmail.com",
        subject: "Account Status Update - SAKE",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Hi, <strong>${firstName}</strong></h2>
            ${statusMessage}
          </div>
        `,
      };
    } else if (type === "operator_status_update") {
      let statusMessage = "";

      if (status === "Verified") {
        statusMessage = `
          <p>Great news! Your operator account has been verified.</p>
          <p>You now have full access to SAKE's account.</p>
          <div style="margin: 20px 0;">
            <a href="https://operator-vert-alpha.vercel.app/login/" 
               style="display: inline-block; background-color:rgb(40, 55, 167); color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               Log in to your operator account
            </a>
          </div>
          <p>Welcome aboard, and thank you for being part of SAKE!</p>
        `;
      } else if (status === "Suspended") {
        statusMessage = `
          <p>We regret to inform you that your operator account has been suspended.</p>
          <p>If you believe this is a mistake, please contact our support team.</p>
        `;
      } else {
        statusMessage = `<p>Your operator account status has been updated to: <strong>${status}</strong>.</p>`;
      }

      msg = {
        to,
        from: process.env.EMAIL_FROM,
        replyTo: "sakeccsfp24@gmail.com",
        bcc: "ccsfpsake@gmail.com",
        subject: "Account Status Update - SAKE",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Hi, <strong>${firstName}</strong></h2>
            ${statusMessage}
          </div>
        `,
      };
    } else {
      return new Response("Invalid email type", { status: 400 });
    }

    await sendgrid.send(msg);
    return new Response("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response("Error sending email", { status: 500 });
  }
}
