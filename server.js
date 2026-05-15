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
        groupId     TEXT,
        ios         TEXT,
        android     TEXT,
        tickets     TEXT DEFAULT '[]'
    )
`);

// Migration: add groupId to existing databases
try { db.exec(`ALTER TABLE rows ADD COLUMN groupId TEXT`); } catch {}

// Migration: backfill groupId for rows that have none
const GROUP_IDS = { 1:'47832', 2:'23591', 3:'61204', 4:'85473', 5:'39216', 6:'74850', 7:'12983', 8:'56741', 9:'93027', 10:'48365', 11:'71209', 12:'34856', 13:'92741', 14:'65038', 15:'27493', 16:'81624', 17:'53907', 18:'46281', 19:'79345', 20:'18627', 21:'64093', 22:'37518', 23:'82946' };
const backfill = db.prepare(`UPDATE rows SET groupId = ? WHERE id = ? AND groupId IS NULL`);
for (const [id, gid] of Object.entries(GROUP_IDS)) backfill.run(gid, Number(id));

// Migration: replace placeholder 777777777 event/account IDs with unique values
const EVENT_IDS   = { 1:721483, 2:753901, 3:682145, 4:741867, 5:780234, 6:768902, 7:739145, 8:744678, 9:726534, 10:830291, 11:741823, 12:750916, 13:792503, 14:827341, 15:856129, 16:807654, 17:820918, 18:765302, 19:778456, 20:798127, 21:825740, 22:764219, 23:842567 };
const ACCOUNT_IDS = { 1:196832, 2:197401, 3:189654, 4:139823, 5:211478, 6:149567, 7:203712, 8:147893, 9:192045, 10:174312, 11:149234, 12:188654, 13:206123, 14:198901, 15:201567, 16:211234, 17:166543, 18:197812, 19:207341, 20:208567, 21:169234, 22:200543, 23:198345 };
const backfillIds = db.prepare(`UPDATE rows SET eventId = ?, accountId = ? WHERE id = ? AND eventId = 777777777`);
for (const [id] of Object.entries(EVENT_IDS)) backfillIds.run(EVENT_IDS[id], ACCOUNT_IDS[id], Number(id));


const SEED_DATA = [
    { id: 1,  eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 721483, accountId: 196832, groupId: '47832', eventName: 'Alpha Summit 2026',      accountName: 'Acme Corp',        whiteLabel: 'Acme Events',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: 'Updated',                        android: 'In review',                  tickets: [] },
    { id: 2,  eventDate: '2026-05-04', endDate: '2026-05-07', eventId: 753901, accountId: 197401, groupId: '23591', eventName: 'Beta Conference 2026',     accountName: 'Bright Solutions', whiteLabel: 'Bright App',      appleDev: 'Sample Apple Dev', googleDev: null,                owner: 'Krystyna', ios: 'In progress',                    android: 'In progress',                tickets: [] },
    { id: 3,  eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 682145, accountId: 189654, groupId: '61204', eventName: 'Cloud Expo 2026',          accountName: 'Catalyst Group',   whiteLabel: 'Catalyst',        appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 4,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 741867, accountId: 139823, groupId: '85473', eventName: 'Delta Forum 2026',         accountName: 'Dynamo Inc',       whiteLabel: 'Dynamo Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Marina',   ios: 'Updated',                        android: 'Updated',                    tickets: [] },
    { id: 5,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 780234, accountId: 211478, groupId: '39216', eventName: 'Elevate 2026',             accountName: 'Echo Systems',     whiteLabel: 'Echo App',        appleDev: null,               googleDev: null,                owner: 'Krystyna', ios: 'Updated',                        android: 'Updated',                    tickets: [] },
    { id: 6,  eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 768902, accountId: 149567, groupId: '74850', eventName: 'Future Tech Summit 2026',  accountName: 'Forge Partners',   whiteLabel: 'Forge Events',    appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Ilia',     ios: 'In review',                      android: 'Updated',                    tickets: [] },
    { id: 7,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 739145, accountId: 203712, groupId: '12983', eventName: 'Global Connect 2026',      accountName: 'Griffin Tech',     whiteLabel: 'Griffin App',     appleDev: null,               googleDev: null,                owner: 'Ilia',     ios: 'License issue/no access to acc', android: 'License issue/no access to acc', tickets: [{ id: 777777, title: 'License renewal blocking dual-platform build', url: 'https://bizzabo.zendesk.com/agent/tickets/777777' }] },
    { id: 8,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 744678, accountId: 147893, groupId: '56741', eventName: 'Horizon Summit 2026',      accountName: 'Harbor Group',     whiteLabel: 'Harbor Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Marina',   ios: 'Updated',                        android: 'Updated',                    tickets: [{ id: 777778, title: 'App Store metadata review feedback', url: 'https://bizzabo.zendesk.com/agent/tickets/777778' }] },
    { id: 9,  eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 726534, accountId: 192045, groupId: '93027', eventName: 'Impact Forum 2026',        accountName: 'Insight Co',       whiteLabel: 'Insight App',     appleDev: null,               googleDev: null,                owner: 'Ilia',     ios: null,                             android: null,                         tickets: [] },
    { id: 10, eventDate: '2026-05-12', endDate: '2026-05-13', eventId: 830291, accountId: 174312, groupId: '48365', eventName: 'Journey Conference 2026',  accountName: 'Junction Labs',    whiteLabel: 'Junction Events', appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 11, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 741823, accountId: 149234, groupId: '71209', eventName: 'Keynote 2026',             accountName: 'Keystone Corp',    whiteLabel: 'Keystone App',    appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: null,                             android: null,                         tickets: [] },
    { id: 12, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 750916, accountId: 188654, groupId: '34856', eventName: 'Leadership Summit 2026',   accountName: 'Lattice Corp',     whiteLabel: 'Lattice Events',  appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: 'Krystyna', ios: null,                             android: null,                         tickets: [] },
    { id: 13, eventDate: '2026-05-12', endDate: '2026-05-16', eventId: 792503, accountId: 206123, groupId: '92741', eventName: 'Maven Conference 2026',    accountName: 'Meridian Group',   whiteLabel: 'Meridian App',    appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 14, eventDate: '2026-05-12', endDate: '2026-05-12', eventId: 827341, accountId: 198901, groupId: '65038', eventName: 'Nexus Forum 2026',         accountName: 'Nova Group',       whiteLabel: 'Nova Events',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 15, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 856129, accountId: 201567, groupId: '27493', eventName: 'Omni Summit 2026',         accountName: 'Orbit Inc',        whiteLabel: 'Orbit App',       appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 16, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 807654, accountId: 211234, groupId: '81624', eventName: 'Pinnacle 2026',            accountName: 'Pinnacle Co',      whiteLabel: 'Pinnacle Events', appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 17, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 820918, accountId: 166543, groupId: '53907', eventName: 'Quantum Forum 2026',       accountName: 'Quantum Group',    whiteLabel: 'Quantum App',     appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 18, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 765302, accountId: 197812, groupId: '46281', eventName: 'Rise Conference 2026',     accountName: 'Radius Corp',      whiteLabel: 'Radius Events',   appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 19, eventDate: '2026-05-20', endDate: '2026-05-21', eventId: 778456, accountId: 207341, groupId: '79345', eventName: 'Summit Connect 2026',      accountName: 'Spectrum Inc',     whiteLabel: 'Spectrum App',    appleDev: null,               googleDev: null,                owner: 'Marina',   ios: 'In review',                      android: 'In review',                  tickets: [] },
    { id: 20, eventDate: '2026-05-21', endDate: '2026-05-21', eventId: 798127, accountId: 208567, groupId: '18627', eventName: 'Transform 2026',           accountName: 'Titan Group',      whiteLabel: 'Titan Events',    appleDev: null,               googleDev: null,                owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 21, eventDate: '2026-05-22', endDate: '2026-05-23', eventId: 825740, accountId: 169234, groupId: '64093', eventName: 'Unity Forum 2026',         accountName: 'Unity Corp',       whiteLabel: 'Unity App',       appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 22, eventDate: '2026-05-27', endDate: '2026-05-27', eventId: 764219, accountId: 200543, groupId: '37518', eventName: 'Venture Summit 2026',      accountName: 'Vertex Inc',       whiteLabel: 'Vertex Events',   appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
    { id: 23, eventDate: '2026-05-30', endDate: '2026-05-31', eventId: 842567, accountId: 198345, groupId: '82946', eventName: 'Wavelength 2026',          accountName: 'Zenith Group',     whiteLabel: 'Zenith App',      appleDev: 'Sample Apple Dev', googleDev: 'Sample Google Dev', owner: null,       ios: null,                             android: null,                         tickets: [] },
];

const rowCount = db.prepare('SELECT COUNT(*) as n FROM rows').get();
if (rowCount.n === 0) {
    const insert = db.prepare(`
        INSERT INTO rows (id, eventDate, endDate, eventId, accountId, groupId, eventName, accountName, whiteLabel, appleDev, googleDev, owner, ios, android, tickets)
        VALUES (@id, @eventDate, @endDate, @eventId, @accountId, @groupId, @eventName, @accountName, @whiteLabel, @appleDev, @googleDev, @owner, @ios, @android, @tickets)
    `);
    for (const row of SEED_DATA) {
        insert.run({ ...row, tickets: JSON.stringify(row.tickets) });
    }
    console.log('Database seeded.');
}

// --- Settings table ---
db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
insertSetting.run('ios_version', '7.10056');
insertSetting.run('android_version', '7.10056');

// --- Middleware ---
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// --- API routes ---
app.get('/api/rows', (_req, res) => {
    const rows = db.prepare('SELECT * FROM rows').all();
    res.json(rows.map((r) => ({ ...r, tickets: JSON.parse(r.tickets) })));
});

app.get('/api/settings', (_req, res) => {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

app.patch('/api/settings/:key', (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'value required' });
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    res.json({ ok: true });
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
