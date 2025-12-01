// Email monitoring service to check for new emails and extract leads
import Imap from "imap";
import { simpleParser } from "mailparser";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Extract phone number from text
function extractPhone(text) {
  if (!text) return null;
  // Match various phone formats
  const phoneRegex = /(\+?63|0)?[9]\d{9}|\d{4}[\s-]?\d{3}[\s-]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0].replace(/\s|-/g, "") : null;
}

// Extract lead information from email
function extractLeadInfo(email) {
  const from = email.from?.value?.[0] || {};
  const subject = email.subject || "";
  const text = email.text || "";
  const html = email.html || "";

  // Extract name from from field
  const name = from.name || from.address?.split("@")[0] || "Unknown";

  // Extract email
  const emailAddress = from.address || "";

  // Extract phone from text or HTML
  const fullText = text + " " + html.replace(/<[^>]*>/g, " ");
  const phone = extractPhone(fullText);

  return {
    name: name.trim(),
    email: emailAddress.trim(),
    phone: phone,
    subject: subject.trim(),
    message: text.trim() || html.replace(/<[^>]*>/g, " ").trim(),
  };
}

// Check for new emails and create leads
export async function checkEmailsForLeads() {
  return new Promise((resolve, reject) => {
    const smtpUser = process.env.SMTP_USER || "info@sunterrasolarenergy.com";
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpPassword) {
      console.error("SMTP_PASSWORD not configured for email monitoring");
      return resolve({ success: false, message: "Email not configured" });
    }

    // Hostinger IMAP settings
    const imapConfig = {
      user: smtpUser,
      password: smtpPassword,
      host: "imap.hostinger.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    };

    const imap = new Imap(imapConfig);
    const newLeads = [];
    const newNotifications = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          console.error("Error opening inbox:", err);
          imap.end();
          return reject(err);
        }

        // Search for emails from today (both read and unread)
        // This ensures we catch emails even if they were already read in the email client
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        imap.search([["SINCE", today]], async (err, results) => {
          if (err) {
            console.error("Error searching emails:", err);
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            console.log("No new emails found");
            imap.end();
            return resolve({
              success: true,
              leads: [],
              notifications: [],
              message: "No new emails",
            });
          }

          console.log(`Found ${results.length} new email(s)`);

          const fetch = imap.fetch(results, {
            bodies: "",
            struct: true,
          });

          let processedCount = 0;

          fetch.on("message", (msg, seqno) => {
            let emailData = "";

            msg.on("body", (stream) => {
              stream.on("data", (chunk) => {
                emailData += chunk.toString("utf8");
              });
            });

            msg.once("end", async () => {
              try {
                const parsed = await simpleParser(emailData);
                const leadInfo = extractLeadInfo(parsed);

                // Check if this email already exists in leads (by messageId or by email+subject)
                if (supabase) {
                  let existing = null;
                  
                  // First check by messageId if available
                  if (parsed.messageId) {
                    const { data } = await supabase
                      .from("leads")
                      .select("id")
                      .eq("email_id", parsed.messageId)
                      .single();
                    existing = data;
                  }
                  
                  // Also check by email and subject to catch duplicates even without messageId
                  if (!existing && leadInfo.email && leadInfo.subject) {
                    const { data } = await supabase
                      .from("leads")
                      .select("id")
                      .eq("email", leadInfo.email)
                      .eq("subject", leadInfo.subject)
                      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours
                      .single();
                    existing = data;
                  }

                  if (existing) {
                    console.log(
                      `Email already processed, skipping`
                    );
                    processedCount++;
                    if (processedCount === results.length) {
                      imap.end();
                      resolve({
                        success: true,
                        leads: newLeads,
                        notifications: newNotifications,
                      });
                    }
                    return;
                  }
                }

                // Create lead in database
                if (supabase && leadInfo.email) {
                  try {
                    const { data: lead, error } = await supabase
                      .from("leads")
                      .insert({
                        name: leadInfo.name,
                        email: leadInfo.email,
                        phone: leadInfo.phone,
                        subject: leadInfo.subject,
                        message: leadInfo.message,
                        source: "email",
                        status: "new",
                        email_id: parsed.messageId,
                      })
                      .select()
                      .single();

                    if (error) {
                      console.error("Error creating lead:", error);
                    } else if (lead) {
                      newLeads.push(lead);

                      // Create notification
                      if (supabase) {
                        await supabase.from("notifications").insert({
                          title: "New Lead from Email",
                          message: `New lead: ${leadInfo.name} (${leadInfo.email}) - ${leadInfo.subject || "No subject"}`,
                          type: "info",
                          read: false,
                        });
                      }

                      newNotifications.push({
                        title: "New Lead from Email",
                        message: `New lead: ${leadInfo.name} (${leadInfo.email})`,
                      });
                    }
                  } catch (error) {
                    console.error("Error processing lead:", error);
                  }
                }

                processedCount++;
                if (processedCount === results.length) {
                  imap.end();
                  resolve({
                    success: true,
                    leads: newLeads,
                    notifications: newNotifications,
                    message: `Processed ${newLeads.length} new lead(s)`,
                  });
                }
              } catch (error) {
                console.error("Error parsing email:", error);
                processedCount++;
                if (processedCount === results.length) {
                  imap.end();
                  resolve({
                    success: true,
                    leads: newLeads,
                    notifications: newNotifications,
                  });
                }
              }
            });
          });

          fetch.once("error", (err) => {
            console.error("Error fetching emails:", err);
            imap.end();
            reject(err);
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err);
      reject(err);
    });

    imap.connect();
  });
}

