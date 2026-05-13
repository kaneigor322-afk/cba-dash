import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
const db = new Database('data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS rows (
        id          INTEGER PRIMARY KEY,
        eventDate   TEXT,
        endDate     TEXT,
        eventId     INTEGER,
        accountId   INTEGER,
        eventName   TEXT,
        accountName TEXT,
        whiteLabel  TEXT,
        appleDev    TEXT,
        googleDev   TEXT,
        owner       TEXT,
        ios         TEXT,
        android     TEXT,
        tickets     TEXT DEFAULT '[]'
    )
`);

const SEED_DATA = [
    { id: 1,  eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 777777777, accountId: 777777777, eventName: 'Alpha Summit 2026',      accountName: 'Acme Corp',        whiteLabel: 'Acme Events',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: 'Updated',                        android: 'In review',                  tickets: [] },
    { id: 2,  eventDate: '2026-05-04', endDate: '2026-05-07', eventId: 777777777, accountId: 777777777, eventName: 'Beta Conference 2026',     accountName: 'Bright Solutions', whiteLabel: 'Bright App',      appleDev: 'Sample Apple Dev', googleDev: null,                owner: 'Krystyna', ios: 'In progress',                    android: 'In progress',                tickets: [] },
    { id: 3,  eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 777777777, accountId: 777777777, eventName: 'Cloud Expo 2026',          accountName: 'Catalyst Group',   whiteLabel: 'Catalyst',        appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 4,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 777777777, accountId: 777777777, eventName: 'Delta Forum 2026',         accountName: 'Dynamo Inc',       whiteLabel: 'Dynamo Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Marina',   ios: 'Updated',                        android: 'Updated',                    tickets: [] },
    { id: 5,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 777777777, accountId: 777777777, eventName: 'Elevate 2026',             accountName: 'Echo Systems',     whiteLabel: 'Echo App',        appleDev: null,               googleDev: null,                owner: 'Krystyna', ios: 'Updated',                        android: 'Updated',                    tickets: [] },
    { id: 6,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 777777777, accountId: 777777777, eventName: 'Future Tech Summit 2026',  accountName: 'Forge Partners',   whiteLabel: 'Forge Events',    appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Ilia',     ios: 'In review',                      android: 'Updated',                    tickets: [] },
    { id: 7,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 777777777, accountId: 777777777, eventName: 'Global Connect 2026',      accountName: 'Griffin Tech',     whiteLabel: 'Griffin App',     appleDev: null,               googleDev: null,                owner: 'Ilia',     ios: 'License issue/no access to acc', android: 'License issue/no access to acc', tickets: [{ id: 777777, title: 'License renewal blocking dual-platform build', url: 'https://bizzabo.zendesk.com/agent/tickets/777777' }] },
    { id: 8,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 777777777, accountId: 777777777, eventName: 'Horizon Summit 2026',      accountName: 'Harbor Group',     whiteLabel: 'Harbor Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Marina',   ios: 'Updated',                        android: 'Updated',                    tickets: [{ id: 777778, title: 'App Store metadata review feedback', url: 'https://bizzabo.zendesk.com/agent/tickets/777778' }] },
    { id: 9,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 777777777, accountId: 777777777, eventName: 'Impact Forum 2026',        accountName: 'Insight Co',       whiteLabel: 'Insight App',     appleDev: null,               googleDev: null,                owner: 'Ilia',     ios: null,                             android: null,                         tickets: [] },
    { id: 10, eventDate: '2026-05-12', endDate: '2026-05-13', eventId: 777777777, accountId: 777777777, eventName: 'Journey Conference 2026',  accountName: 'Junction Labs',    whiteLabel: 'Junction Events', appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 11, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 777777777, accountId: 777777777, eventName: 'Keynote 2026',             accountName: 'Keystone Corp',    whiteLabel: 'Keystone App',    appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: null,                             android: null,                         tickets: [] },
    { id: 12, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 777777777, accountId: 777777777, eventName: 'Leadership Summit 2026',   accountName: 'Lattice Corp',     whiteLabel: 'Lattice Events',  appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: null,                             android: null,                         tickets: [] },
    { id: 13, eventDate: '2026-05-12', endDate: '2026-05-16', eventId: 777777777, accountId: 777777777, eventName: 'Maven Conference 2026',    accountName: 'Meridian Group',   whiteLabel: 'Meridian App',    appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 14, eventDate: '2026-05-12', endDate: '2026-05-12', eventId: 777777777, accountId: 777777777, eventName: 'Nexus Forum 2026',         accountName: 'Nova Group',       whiteLabel: 'Nova Events',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 15, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 777777777, accountId: 777777777, eventName: 'Omni Summit 2026',         accountName: 'Orbit Inc',        whiteLabel: 'Orbit App',       appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 16, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 777777777, accountId: 777777777, eventName: 'Pinnacle 2026',            accountName: 'Pinnacle Co',      whiteLabel: 'Pinnacle Events', appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 17, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 777777777, accountId: 777777777, eventName: 'Quantum Forum 2026',       accountName: 'Quantum Group',    whiteLabel: 'Quantum App',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 18, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 777777777, accountId: 777777777, eventName: 'Rise Conference 2026',     accountName: 'Radius Corp',      whiteLabel: 'Radius Events',   appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 19, eventDate: '2026-05-20', endDate: '2026-05-21', eventId: 777777777, accountId: 777777777, eventName: 'Summit Connect 2026',      accountName: 'Spectrum Inc',     whiteLabel: 'Spectrum App',    appleDev: null,               googleDev: null,                owner: 'Marina',   ios: 'In review',                      android: 'In review',                  tickets: [] },
    { id: 20, eventDate: '2026-05-21', endDate: '2026-05-21', eventId: 777777777, accountId: 777777777, eventName: 'Transform 2026',           accountName: 'Titan Group',      whiteLabel: 'Titan Events',    appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 21, eventDate: '2026-05-22', endDate: '2026-05-23', eventId: 777777777, accountId: 777777777, eventName: 'Unity Forum 2026',         accountName: 'Unity Corp',       whiteLabel: 'Unity App',       appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 22, eventDate: '2026-05-27', endDate: '2026-05-27', eventId: 777777777, accountId: 777777777, eventName: 'Venture Summit 2026',      accountName: 'Vertex Inc',       whiteLabel: 'Vertex Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 23, eventDate: '2026-05-30', endDate: '2026-05-31', eventId: 777777777, accountId: 777777777, eventName: 'Wavelength 2026',          accountName: 'Zenith Group',     whiteLabel: 'Zenith App',      appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
];

const rowCount = db.prepare('SELECT COUNT(*) as n FROM rows').get();
if (rowCount.n === 0) {
    const insert = db.prepare(`
        INSERT INTO rows (id, eventDate, endDate, eventId, accountId, eventName, accountName, whiteLabel, appleDev, googleDev, owner, ios, android, tickets)
        VALUES (@id, @eventDate, @endDate, @eventId, @accountId, @eventName, @accountName, @whiteLabel, @appleDev, @googleDev, @owner, @ios, @android, @tickets)
    `);
    for (const row of SEED_DATA) {
        insert.run({ ...row, tickets: JSON.stringify(row.tickets) });
    }
    console.log('Database seeded.');
}

// --- Middleware ---
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// --- API routes ---
app.get('/api/rows', (_req, res) => {
    const rows = db.prepare('SELECT * FROM rows').all();
    res.json(rows.map((r) => ({ ...r, tickets: JSON.parse(r.tickets) })));
});

app.patch('/api/rows/:id', (req, res) => {
    const { id } = req.params;
    const allowed = ['owner', 'ios', 'android', 'tickets'];
    const fields = Object.keys(req.body).filter((k) => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const setClauses = fields.map((f) => `${f} = @${f}`).join(', ');
    const values = { id: Number(id) };
    for (const f of fields) values[f] = req.body[f];

    db.prepare(`UPDATE rows SET ${setClauses} WHERE id = @id`).run(values);
    res.json({ ok: true });
});

// --- SPA fallback ---
app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
