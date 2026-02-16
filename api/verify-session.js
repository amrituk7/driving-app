import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    return res.status(200).json({
      status: session.payment_status,
      paymentId: session.metadata.paymentId,
      studentName: session.metadata.studentName,
      amountPaid: session.amount_total / 100,
      currency: session.currency,
      customerEmail: session.customer_email,
      paidAt: session.payment_status === "paid"
        ? new Date(session.created * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("Session verification error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
