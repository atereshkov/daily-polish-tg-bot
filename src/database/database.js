import pg from 'pg';

const pool = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.DATABASE_PORT) || 5432
});

export async function createUser(tgId, languageCode) {
    const query = {
        text: 'INSERT INTO users(tg_id, language_code) VALUES($1, $2)',
        values: [tgId, languageCode]
    }
    return await pool.query(query);
}

export async function updateUserLanguage(tgId, languageCode) {
    const query = {
        text: 'UPDATE users SET language_code = $1 WHERE tg_id = $2',
        values: [languageCode, tgId]
    }
    return await pool.query(query);
}

export async function isUserExists(tgId) {
    const query = {
        text: 'SELECT EXISTS(SELECT 1 FROM users WHERE tg_id = $1)',
        values: [tgId]
    }
    return await pool.query(query);
}