const axios = require("axios");

const SLACK_WEBHOOK_URL =
  "https://hooks.slack.com/services/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";

async function sendSlackAlert(message) {
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: message,
    });

    console.log("✅ Slack alert sent");
  } catch (error) {
    console.error("❌ Slack error:", error.message);
  }
}

module.exports = { sendSlackAlert };
