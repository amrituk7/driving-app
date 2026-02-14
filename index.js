const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

// Replace with your real Stripe secret key
const stripe = Stripe("sk_live_...DZNn");

// Create a Stripe Connect account for an instructor
exports.createStripeAccount = functions.https.onCall(async (data, context) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: data.email,
    });

    return { accountId: account.id };
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Generate onboarding link
exports.generateOnboardingLink = functions.https.onCall(async (data, context) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: data.accountId,
      refresh_url: "https://your-frontend-url.com/refresh",
      return_url: "https://your-frontend-url.com/success",
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Error generating onboarding link:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});