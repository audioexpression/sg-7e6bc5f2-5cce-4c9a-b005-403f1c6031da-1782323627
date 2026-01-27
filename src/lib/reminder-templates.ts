export interface ReminderTemplate {
  id: string;
  name: string;
  timing: string;
  message: (data: ReminderData) => string;
}

export interface ReminderData {
  memberName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  billingPeriod: string;
  daysUntilDue?: number;
  daysOverdue?: number;
  paymentLink?: string;
}

export interface ReminderLog {
  id: string;
  invoiceId: string;
  sentAt: string;
  sentBy: string;
  templateUsed: string;
  status: "Sent" | "Failed";
}

export const BULLDOGS_ADMIN_WHATSAPP = "6281234567890"; // Update with actual admin number

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "7-days-before",
    name: "7 Days Before Due",
    timing: "7 days before due date",
    message: (data: ReminderData) => `
Hi ${data.memberName}! 👋

This is a friendly reminder from Bali Bulldogs FC that your ${data.billingPeriod} membership payment is due in ${data.daysUntilDue} days.

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${data.paymentLink ? `You can pay online here: ${data.paymentLink}` : "Please reply for payment details."}

Thank you for your continued support! 🐶⚽

Bali Bulldogs Admin Team
    `.trim(),
  },
  {
    id: "due-today",
    name: "Due Today",
    timing: "On due date",
    message: (data: ReminderData) => `
Hi ${data.memberName}! 👋

This is a reminder that your ${data.billingPeriod} membership payment is due TODAY.

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${data.paymentLink ? `Pay online here: ${data.paymentLink}` : "Please reply for payment details."}

If you've already paid, please disregard this message.

Thank you! 🐶⚽

Bali Bulldogs Admin Team
    `.trim(),
  },
  {
    id: "3-days-overdue",
    name: "3 Days Overdue",
    timing: "3 days after due date",
    message: (data: ReminderData) => `
Hi ${data.memberName},

We noticed your ${data.billingPeriod} membership payment is now ${data.daysOverdue} days overdue.

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${data.paymentLink ? `Pay online here: ${data.paymentLink}` : ""}

If you're experiencing any issues with payment, please let us know so we can help.

If you've already paid, please send us confirmation.

Thank you,
Bali Bulldogs Admin Team 🐶⚽
    `.trim(),
  },
  {
    id: "7-days-overdue",
    name: "7 Days Overdue",
    timing: "7 days after due date",
    message: (data: ReminderData) => `
Hi ${data.memberName},

Your ${data.billingPeriod} membership payment is now ${data.daysOverdue} days overdue. We need to receive payment to maintain your membership status.

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${data.paymentLink ? `Pay online here: ${data.paymentLink}` : ""}

Please contact us if you need to discuss payment arrangements.

If payment has been made, please send confirmation.

Bali Bulldogs Admin Team 🐶⚽
    `.trim(),
  },
  {
    id: "14-days-overdue",
    name: "14 Days Overdue - Final Notice",
    timing: "14 days after due date",
    message: (data: ReminderData) => `
Hi ${data.memberName},

FINAL NOTICE: Your ${data.billingPeriod} membership payment is now ${data.daysOverdue} days overdue.

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

⚠️ Without payment within 3 days, we'll need to suspend your membership and training access.

${data.paymentLink ? `Pay online here: ${data.paymentLink}` : ""}

Please contact us immediately if there are any issues.

Bali Bulldogs Admin Team 🐶⚽
    `.trim(),
  },
  {
    id: "custom",
    name: "Custom Message",
    timing: "Anytime",
    message: (data: ReminderData) => `
Hi ${data.memberName}! 👋

Regarding your ${data.billingPeriod} membership payment:

📋 Invoice #: ${data.invoiceNumber}
💰 Amount: Rp ${data.amount.toLocaleString("id-ID")}
📅 Due Date: ${new Date(data.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

[Add your custom message here]

${data.paymentLink ? `Payment link: ${data.paymentLink}` : ""}

Thank you,
Bali Bulldogs Admin Team 🐶⚽
    `.trim(),
  },
];

export const calculateReminderStatus = (invoice: { dueDate: string; status: string }): {
  urgency: "upcoming" | "due-today" | "overdue" | "paid";
  daysUntilDue?: number;
  daysOverdue?: number;
  suggestedTemplate?: string;
} => {
  if (invoice.status === "Paid") {
    return { urgency: "paid" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    // Upcoming
    let suggestedTemplate;
    if (diffDays <= 7) {
      suggestedTemplate = "7-days-before";
    }
    return {
      urgency: "upcoming",
      daysUntilDue: diffDays,
      suggestedTemplate,
    };
  } else if (diffDays === 0) {
    // Due today
    return {
      urgency: "due-today",
      daysUntilDue: 0,
      suggestedTemplate: "due-today",
    };
  } else {
    // Overdue
    const overdueDays = Math.abs(diffDays);
    let suggestedTemplate;
    if (overdueDays >= 14) {
      suggestedTemplate = "14-days-overdue";
    } else if (overdueDays >= 7) {
      suggestedTemplate = "7-days-overdue";
    } else if (overdueDays >= 3) {
      suggestedTemplate = "3-days-overdue";
    }
    
    return {
      urgency: "overdue",
      daysOverdue: overdueDays,
      suggestedTemplate,
    };
  }
};

export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  // Remove any non-numeric characters
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  
  // Ensure it starts with country code (62 for Indonesia)
  const formattedPhone = cleanPhone.startsWith("62") ? cleanPhone : `62${cleanPhone}`;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};