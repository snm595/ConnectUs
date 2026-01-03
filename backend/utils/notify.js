const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

/**
 * Send an SMS using Twilio
 * @param {string[]} recipients - Array of phone numbers (in E.164 format, e.g. +1234567890)
 * @param {string} text - The message to send
 * @returns {Promise<Array>} - Array of result objects for each recipient
 */
exports.sendSMS = async (recipients, text) => {
  if (!recipients || recipients.length === 0) return [];
  const results = [];
  for (const to of recipients) {
    try {
      const res = await client.messages.create({
        body: text,
        from: twilioNumber,
        to
      });
      results.push({ to, status: 'success', sid: res.sid });
    } catch (err) {
      console.error('Failed to send SMS to', to, err.message);
      results.push({ to, status: 'failed', error: err.message });
    }
  }
  return results;
};
