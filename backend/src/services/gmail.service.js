const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar' // Added for Scheduling
];

class GmailService {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.error("❌ Missing Google OAuth Credentials in .env");
        }

        if (!process.env.GOOGLE_REDIRECT_URI) {
            console.error("❌ GOOGLE_REDIRECT_URI is not set!");
        } else if (process.env.GOOGLE_REDIRECT_URI.includes('localhost') && process.env.NODE_ENV === 'production') {
            console.warn("⚠️ [SECURITY] GOOGLE_REDIRECT_URI is set to localhost in PRODUCTION!");
        }
    }

    getAuthUrl(state = '') {
        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // Crucial for getting refresh_token
            scope: SCOPES,
            state: state
        });
    }

    async setCredentials(code) {
        const { tokens } = await this.oAuth2Client.getToken(code);
        this.oAuth2Client.setCredentials(tokens);
        return tokens;
    }

    setCredentialsFromTokens(tokens) {
        this.oAuth2Client.setCredentials(tokens);
    }

    isAuthenticated() {
        return !!this.oAuth2Client.credentials.access_token;
    }

    async listMessages(query = 'subject:(application OR applied OR "thank you" OR "interview" OR "offer" OR "rejected" OR "update" OR "status" OR "assessment" OR "round" OR "submission" OR "hiring") -credit -card -statement -newsletter -bill -invoice -alert -notification -from:me') {
        if (!this.isAuthenticated()) throw new Error("Not authenticated");

        const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 200
        });

        return res.data.messages || [];
    }

    async getMessage(id) {
        if (!this.isAuthenticated()) throw new Error("Not authenticated");

        const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: id,
        });

        return res.data;
    }

    async createCalendarEvent(eventDetails) {
        if (!this.isAuthenticated()) throw new Error("Not authenticated");

        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        // eventDetails: { summary, description, start: { dateTime }, end: { dateTime } }
        // Default to Google Meet if possible? (Optional upgrade)

        const event = {
            summary: eventDetails.summary,
            location: eventDetails.location || 'Online',
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.startTime, // ISO String
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventDetails.endTime, // ISO String
                timeZone: 'UTC',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        try {
            const res = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });
            console.log("📅 Calendar Event Created:", res.data.htmlLink);
            return res.data;
        } catch (err) {
            console.error("Failed to create calendar event:", err);
            // Don't crash the sync, just log error
            return null;
        }
    }
}

module.exports = new GmailService();
