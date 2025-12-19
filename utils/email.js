const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInviteEmail = async (toEmail, inviterName, boardName) => {
    try {
        await resend.emails.send({
            from: 'OurFlow <onboarding@resend.dev>',
            to: toEmail,
            subject: `${inviterName} invited you to collaborate on "${boardName}"`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #f5c518; margin-bottom: 24px;">OurFlow</h1>
                    <h2 style="color: #333; margin-bottom: 16px;">You've been invited!</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        <strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${boardName}"</strong>.
                    </p>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Log in to OurFlow to start collaborating.
                    </p>
                    <a href="https://ourflow.app" style="display: inline-block; background: #f5c518; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
                        Open OurFlow
                    </a>
                    <p style="color: #888; font-size: 14px; margin-top: 32px;">
                        If you don't have an account yet, sign up with this email address to access the project.
                    </p>
                </div>
            `
        });
        console.log('Invite email sent to:', toEmail);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

module.exports = { sendInviteEmail };