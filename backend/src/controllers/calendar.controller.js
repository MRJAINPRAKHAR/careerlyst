const pool = require("../config/db");

const getEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start, end } = req.query; // YYYY-MM-DD

        // 1. Fetch Manual Events
        let eventQuery = `
            SELECT id, title, description, event_type, event_date, source 
            FROM events 
            WHERE user_id = ? 
        `;
        let eventParams = [userId];

        if (start && end) {
            eventQuery += ` AND event_date BETWEEN ? AND ? `;
            eventParams.push(start + " 00:00:00", end + " 23:59:59");
        }
        eventQuery += ` ORDER BY event_date ASC`;

        const [manualEvents] = await pool.query(eventQuery, eventParams);

        // 2. Fetch Applications (Auto-Events)
        let appQuery = `
            SELECT id, company, role, status, date_applied, ai_chance 
            FROM applications 
            WHERE user_id = ? 
        `;
        let appParams = [userId];

        if (start && end) {
            appQuery += ` AND date_applied BETWEEN ? AND ? `;
            appParams.push(start + " 00:00:00", end + " 23:59:59");
        }

        const [applications] = await pool.query(appQuery, appParams);

        // 3. Map Applications to Events
        const autoEvents = applications.map(app => {
            let type = 'remark';
            let titlePrefix = 'Applied:';

            if (app.status === 'Interview') {
                type = 'interview';
                titlePrefix = 'Interview:';
            } else if (app.status === 'Offer') {
                type = 'meeting';
                titlePrefix = 'Offer:';
            } else if (app.status === 'Rejected') {
                type = 'remark';
                titlePrefix = 'Rejected:';
            }

            return {
                id: `app_${app.id}`, // String ID to distinguish
                user_id: userId,
                title: `${titlePrefix} ${app.company}`,
                description: `${app.role} (${app.status})`,
                event_type: type,
                event_date: app.date_applied,
                source: 'auto_application'
            };
        });

        // 4. Merge & Sort
        const allEvents = [...manualEvents, ...autoEvents].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        res.json(allEvents);
    } catch (err) {
        console.error("Get Events Error:", err);
        res.status(500).json({ message: "Failed to fetch events" });
    }
};

const createEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, event_date, event_type = 'meeting', source = 'manual' } = req.body;

        if (!title || !event_date) {
            return res.status(400).json({ message: "Title and Date are required" });
        }

        const [result] = await pool.query(
            `INSERT INTO events (user_id, title, description, event_type, event_date, source) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, title, description, event_type, event_date, source]
        );

        res.status(201).json({ id: result.insertId, message: "Event created" });
    } catch (err) {
        console.error("Create Event Error:", err);
        res.status(500).json({ message: "Failed to create event" });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        await pool.query("DELETE FROM events WHERE id = ? AND user_id = ?", [eventId, userId]);
        res.json({ message: "Event deleted" });
    } catch (err) {
        console.error("Delete Event Error:", err);
        res.status(500).json({ message: "Failed to delete event" });
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
