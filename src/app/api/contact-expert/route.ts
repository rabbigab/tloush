import { NextRequest, NextResponse } from "next/server";
import { experts } from "@/data/experts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, expertSlug, expertName } = body;

    if (!name || !email || !message || !expertSlug) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || "eboost.il@gmail.com";

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Tloush <noreply@tloush.com>",
          to: [FOUNDER_EMAIL],
          replyTo: email,
          subject: `[Tloush] Nouveau lead — ${expertName || expertSlug}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#2563eb;">Nouveau lead Tloush</h2>
              <p><strong>Expert contacté :</strong> ${expertName}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p><strong>Nom :</strong> ${name}</p>
              <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ""}
              <p><strong>Message :</strong></p>
              <blockquote style="background:#f3f4f6;border-left:4px solid #2563eb;padding:12px 16px;margin:0;border-radius:4px;">
                ${message}
              </blockquote>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p style="color:#6b7280;font-size:12px;">Tloush — Plateforme RH francophone en Israël</p>
            </div>
          `,
        }),
      });
    } else {
      console.log("[TLOUSH LEAD]", { expert: expertName, from: { name, email, phone }, message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact-expert]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
