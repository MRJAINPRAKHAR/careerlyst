const cheerio = require('cheerio');
const gmailService = require('./gmail.service');

class ParserService {

    parse(emailData) {
        const snippet = emailData.snippet;
        const headers = emailData.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';

        let body = "";
        if (emailData.payload.parts) {
            const part = emailData.payload.parts.find(p => p.mimeType === 'text/html') || emailData.payload.parts[0];
            if (part && part.body.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        } else if (emailData.payload.body.data) {
            body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
        }

        const $ = cheerio.load(body);
        // Normalize text: remove excessive whitespace
        const textBody = $.text().replace(/\s\s+/g, ' ').trim();
        const htmlBody = $.html(); // Keep HTML for specific structure checks

        let company = "Unknown";
        let role = "Unknown";
        let status = "Applied";

        // --- STRATEGY 1: LinkedIn ---
        if (from.includes("linkedin")) {

            // Case A: "You applied for [Role] at [Company]"
            // Case B: "Your application was sent to [Company]"
            // Case C: "You applied to [Company]"

            const appliedForAtMatch = subject.match(/(?:You applied for|Application sent for) (.+) at (.+)/i);
            if (appliedForAtMatch) {
                role = appliedForAtMatch[1];
                company = appliedForAtMatch[2];
            }

            else if (subject.match(/Application sent to (.+)/i)) {
                company = subject.match(/Application sent to (.+)/i)[1];
                // Try to find role in body
                // "You applied for [Role] at [Company]" in body text
                const valMatch = textBody.match(/You applied for (.+) at/i);
                if (valMatch) role = valMatch[1];
            }

            else if (subject.match(/You applied to (.+)/i)) {
                company = subject.match(/You applied to (.+)/i)[1];
                // Try to find role in body (LinkedIn often bolds it: "Your application for <b>Role</b>")
                const roleMatch = htmlBody.match(/Your application for\s*<[^>]+>(.+?)<\/[^>]+>/i);
                if (roleMatch) {
                    role = roleMatch[1];
                } else {
                    // Fallback text search
                    const textMatch = textBody.match(/Your application for (.+) was sent/i);
                    if (textMatch) role = textMatch[1];
                }
            }
        }

        // --- STRATEGY 2: Common ATS (Greenhouse, Lever, etc) ---

        // Subject: "Application received for [Role] at [Company]"
        if (company === "Unknown") {
            const commonMatch = subject.match(/Application received for (.+) at (.+)/i);
            if (commonMatch) {
                role = commonMatch[1];
                company = commonMatch[2];
            }
        }

        // Subject: "Thank you for applying to [Company]"
        if (company === "Unknown") {
            const thanksMatch = subject.match(/Thank you for applying to (.+)/i);
            if (thanksMatch) {
                company = thanksMatch[1];
            }
        }

        // --- STRATEGY 3: Body Fallbacks ---

        if (role === "Unknown" && company !== "Unknown") {
            // Look for "position of [Role]" or "role of [Role]"
            let roleMatch = textBody.match(/(?:position|role) of (.+?)(\.| at| with| for)/i);
            if (roleMatch) role = roleMatch[1];

            // Look for "... for the [Role] position"
            if (role === "Unknown") {
                roleMatch = textBody.match(/for the (.+?) position/i);
                if (roleMatch) role = roleMatch[1];
            }
        }

        if (company === "Unknown" && role === "Unknown") {
            // Final catch-all: "Your application to [Company]"
            const yourAppMatch = subject.match(/Your application to (.+)/i);
            if (yourAppMatch) company = yourAppMatch[1];
        }

        // Cleanup
        company = company.trim();
        role = role.trim();
        if (company.toLowerCase().includes("linkedin")) company = "LinkedIn Job";

        // Mock Fallback removed in favor of Sender Name fallback

        // --- DATE PARSING ---
        // Gmail API provides 'internalDate' (timestamp in ms string)
        let emailDate = new Date();
        if (emailData.internalDate) {
            emailDate = new Date(parseInt(emailData.internalDate));
        }
        const year = emailDate.getFullYear();

        // --- STATUS DETECTION ---
        // Default to "Applied"
        const lowerSubject = subject.toLowerCase();
        const lowerBody = textBody.toLowerCase();
        const lowerSender = from.toLowerCase();

        // BLOCKLIST / ANTI-SPAM
        if (lowerSender.includes("newsletter") ||
            lowerSender.includes("marketing") ||
            lowerSender.includes("store") ||
            lowerSender.includes("promo") ||
            lowerSender.includes("facebook") ||
            lowerSender.includes("instagram") ||
            lowerSender.includes("pinterest") ||
            lowerSender.includes("tiktok") ||
            lowerSender.includes("message@") || // Generic messaging
            year < 2023 // Ignore ancient emails if desired? User had 2021.
        ) {
            return null;
        }

        // Explicitly block "order", "receipt", "meds", "pharmacy" in subject if Company is Unknown
        if (lowerSubject.includes("order") ||
            lowerSubject.includes("receipt") ||
            lowerSubject.includes("invoice") ||
            lowerSubject.includes("delivery") ||
            lowerSubject.includes("medicine") ||
            (company.toLowerCase().includes("netmeds") || company.toLowerCase().includes("pharmeasy"))) {
            return null;
        }

        if (lowerSubject.includes("hiring") || lowerSubject.includes("opening") || lowerSubject.includes("we are hiring") || lowerSubject.includes("opportunity") || lowerSubject.includes("urgent")) {
            status = "Hiring";
        }
        else if (lowerSubject.includes("interview") || lowerBody.includes("interview invitation") || lowerBody.includes("schedule an interview") || lowerBody.includes("video submission") || lowerBody.includes("video assessment")) {
            status = "Interview";
        }
        // Strict Offer Check: Must be JOB offer
        else if (lowerSubject.includes("job offer") || lowerSubject.includes("employment offer") || lowerBody.includes("offer of employment") || (lowerSubject.includes("offer") && lowerSubject.includes("letter"))) {
            status = "Offer";
        }
        else if (lowerSubject.includes("rejected") || lowerSubject.includes("unfortunately") || lowerBody.includes("thank you for your interest") || lowerBody.includes("not moving forward")) {
            status = "Rejected";
        }
        else if (lowerSubject.includes("assessment") || lowerSubject.includes("round") || lowerBody.includes("coding challenge") || lowerBody.includes("take the assessment") || lowerSubject.includes("hackathon") || lowerSubject.includes("challenge")) {
            status = "Interview";
        }

        // --- CALENDAR AUTOMATION ---
        if (status === "Interview") {
            try {
                this.scheduleInterviewIfPossible({
                    subject,
                    body: textBody,
                    company,
                    role
                });
            } catch (e) {
                console.error("Calendar Sync Error:", e.message);
            }
        }


        // --- STRATEGY 5: Final Fallback - Use Sender Name ---
        if (company === "Unknown") {
            // Extract name from "Name <email@domain.com>"
            const match = from.match(/^"?([^"<]+)"?\s*<.+>$/);
            if (match) {
                const senderName = match[1].trim();
                // Filter out generic names
                if (!senderName.toLowerCase().includes("ticket") &&
                    !senderName.toLowerCase().includes("support") &&
                    //!senderName.toLowerCase().includes("team") && // Allowed "Team" (e.g. Hiring Team)
                    !senderName.toLowerCase().includes("info") &&
                    !senderName.includes("@")) { // Basic filters
                    company = senderName;
                }
            }
        }

        // Validity Check: STRICT
        // 1. If Company is still Unknown, we can't index it.
        if (company === "Unknown") return null;

        // 2. If Role is Unknown, check if it's a valid "General" email or really spam.
        if (role === "Unknown") {
            // Removed "offer" from keywords to avoid "Special Offer" spam
            // Added "challenge", "hackathon" for Unstop/Juspay
            // Added "declared", "results", "round", "submission" for "Video Submission Round Results declared!"
            // Added "applied" for LinkedIn "You applied to..."
            const jobKeywords = ["application", "apply", "applied", "hiring", "opening", "job", "interview", "job offer", "resume", "candidate", "career", "hackathon", "challenge", "developer", "engineer", "internship", "submission", "round", "results", "assessment"];
            const hasKeyword = jobKeywords.some(k => lowerSubject.includes(k));

            if (hasKeyword) {
                role = "General Application";
            } else {
                return null;
            }
        }

        // Clean Role if it captured "at [Company]" by mistake
        if (role.includes(" at ")) {
            role = role.split(" at ")[0];
        }

        return {
            company,
            role,
            status,
            date: emailDate, // Return actual Date object
            source: 'gmail_automation',
            aiChance: Math.floor(Math.random() * 30) + 60
        };
    }
    async scheduleInterviewIfPossible({ subject, body, company, role }) {
        // Simple Heuristic Date Extraction (YYYY-MM-DD HH:MM or similar)
        // This is tricky without a heavy NLP library. 
        // We will look for "on [Month] [Day] at [Time]" or specific patterns.

        // Regex for Date: (Jan|Feb...) \d{1,2}
        const dateRegex = /(?:on\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?/i;
        const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

        const dateMatch = body.match(dateRegex);
        const timeMatch = body.match(timeRegex);

        if (dateMatch && timeMatch) {
            const currentYear = new Date().getFullYear();
            const monthStr = dateMatch[1];
            const day = parseInt(dateMatch[2]);
            const hour = parseInt(timeMatch[1]);
            const min = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const period = timeMatch[3].toLowerCase();

            // Parse Month
            const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
            const month = months[monthStr.toLowerCase().substring(0, 3)];

            // 12-hour Convert
            let finalHour = hour;
            if (period === 'pm' && hour < 12) finalHour += 12;
            if (period === 'am' && hour === 12) finalHour = 0;

            const startDate = new Date(currentYear, month, day, finalHour, min);

            // If date is in past, assume next year? Or ignore.
            if (startDate < new Date()) {
                // simple assumption: ignore past dates or assume user is re-syncing old emails
                // We typically don't want to spam calendar with old events.
                return;
            }

            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1); // Default 1 hour

            console.log(`[PARSER] 📅 Creating Calendar Event for ${company}`);

            await gmailService.createCalendarEvent({
                summary: `Interview: ${role} at ${company}`,
                description: `Context: ${subject}\n\n${body.substring(0, 500)}...`,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString()
            });
        }
    }
}

module.exports = new ParserService();
