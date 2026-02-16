import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      paymentId,
      studentName,
      studentEmail,
      amount,
      lessonDescription,
      instructorId,
    } = req.body;

    // Validate required fields
    if (!paymentId || !amount || !studentName) {
      return res.status(400).json({ error: "Missing required fields: paymentId, amount, studentName" });
    }

    const amountInPence = Math.round(parseFloat(amount) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: studentEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Driving Lesson - ${studentName}`,
              description: lessonDescription || "Driving lesson payment",
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId,
        studentName,
        instructorId: instructorId || "",
      },
      success_url: `${req.headers.origin}/payments?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payments?stripe=cancelled`,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
