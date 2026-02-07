import { AppError } from "../../utils/response";
import prisma from "../../prisma";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { transportEmail } from "../../libs/nodemailer";

interface FonntePayload {
  status: boolean;
  detail: string;
  sender: string;
  name?: string;
  message: string;
  timestamp: number | string;
}

export const handleFonnteWebhookService = async (payload: FonntePayload) => {
  try {
    const phone = payload.sender.split("@")[0].replace(/^0/, "62");

    if (!phone || phone.length < 9) {
      return { isNew: false, reason: "Invalid sender" };
    }

    const requestDate = new Date(Number(payload.timestamp) * 1000);

    const existingLead = await prisma.lead.findFirst({
      where: {
        phone: phone,
        requestDate: requestDate, 
        },
    });

    if (existingLead) {
      console.log(`Duplicate webhook ignored: ${phone} at ${requestDate}`);
      return {
        isNew: false,
        leadId: existingLead.id,
        reason: "Already exists",
      };
    }

    const lead = await prisma.lead.create({
      data: {
        name: payload.name || "Unknown",
        message: payload.message || "-",
        phone,
        source: "fonnte",
        status: "UNCLAIMED",
        requestDate,
      },
    });

    try {
      const templatePath = path.join(__dirname, "../../templates", "notification.hbs");
      
      if (fs.existsSync(templatePath)) {
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const compiledTemplate = Handlebars.compile(templateSource);
        
        const users = await prisma.user.findMany({
          select: { email: true },
        });

        const recipientEmails = users.map((u) => u.email).filter(Boolean);

        if (recipientEmails.length > 0) {
          const html = compiledTemplate({
            name: lead.name,
            phone,
            message: payload.message,
            time: requestDate.toLocaleString("id-ID"),
            link: process.env.BASE_URL_FE,
            year: new Date().getFullYear(),
          });

          await transportEmail.sendMail({
            from: `"Powersurya CRM" <${process.env.SMTP_USER}>`,
            to: recipientEmails.join(", "),
               subject: "📩 New WhatsApp Lead",
            html,
          });
          
          console.log("Email notification sent successfully.");
        }
      } else {
        console.warn("Email template not found, skipping email.");
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    return {
      isNew: true,
      leadId: lead.id,
    };

  } catch (error) {
    console.error("Fonnte webhook error:", error);
    throw new AppError("Failed to process Fonnte webhook", 500);
  }
};