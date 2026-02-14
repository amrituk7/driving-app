import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export async function createStripeAccount(userId) {
  const callable = httpsCallable(functions, "createStripeAccount");
  const result = await callable({ userId });
  return result.data;
}

export async function generateOnboardingLink(accountId) {
  const callable = httpsCallable(functions, "generateOnboardingLink");
  const result = await callable({ accountId });
  return result.data;
}