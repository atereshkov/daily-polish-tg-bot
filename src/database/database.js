import pg from 'pg';

let pool;

if (process.env.NODE_ENV === "production") {
    pool = new pg.Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: Number(process.env.DATABASE_PORT) || 5432
    });
} else {
    pool = new pg.Pool({
        user: process.env.PGUSER_TEST,
        host: process.env.PGHOST_TEST,
        database: process.env.PGDATABASE_TEST,
        password: process.env.PGPASSWORD_TEST,
        port: Number(process.env.DATABASE_PORT_TEST) || 5432
    });
}

// users

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

export async function getUser(tgId) {
    const query = {
        text: 'SELECT * FROM users WHERE tg_id = $1',
        values: [tgId]
    }
    return await pool.query(query);
}

// user_stats

export async function getUserStats(tgId) {
    const query = {
        text: 'SELECT * FROM user_stats WHERE tg_id = $1',
        values: [tgId]
    }
    return await pool.query(query);
}

export async function createUserStats(tgId) {
    const query = {
        text: 'INSERT INTO user_stats(tg_id) VALUES($1)',
        values: [tgId]
    }
    return await pool.query(query);
}

export async function updateUserAnswers(tgId, isRight) {
    const column = isRight ? 'right_answers' : 'wrong_answers';
    const query = {
        text: `UPDATE user_stats set ${column} = ${column} + 1 WHERE tg_id = $1`,
        values: [tgId]
    }
    return await pool.query(query);
}

export async function updateUserWordsStats(tgId) {
    const query = {
        text: `UPDATE user_stats set words_added = words_added + 1 WHERE tg_id = $1`,
        values: [tgId]
    }
    return await pool.query(query);
}

// words

export async function getWord(origin) {
    const query = {
        text: 'SELECT * FROM words_ru WHERE origin = $1',
        values: [origin]
    }
    return await pool.query(query);
}

export async function getRandomWord() {
    const query = {
        // text: `SELECT * FROM words_ru TABLESAMPLE SYSTEM_ROWS(1)`, // for larget datasets (https://www.postgresql.org/docs/current/tsm-system-rows.html)
        text: `SELECT * FROM words_ru ORDER BY RANDOM() LIMIT 1`, // for small datasets
        values: []
    }
    return await pool.query(query);
}

export async function getRandomUserWord(tgId) {
    const query = {
        text: `SELECT * FROM words_ru WHERE owner_tg_id = $1 ORDER BY RANDOM() LIMIT 1`,
        values: [tgId]
    }
    return await pool.query(query);
}

export async function saveWord(word, tgId) {
    const translation1 = word.translations[0];
    const translation2 = word.translations[1];
    const translation3 = word.translations[2];
    const translation4 = word.translations[3];
    const query = {
        text: 'INSERT INTO words_ru(origin, translation1, translation2, translation3, translation4, right_translation, owner_tg_id) VALUES($1, $2, $3, $4, $5, $6, $7)',
        values: [word.origin, translation1, translation2, translation3, translation4, word.rightTranslation, tgId]
    }
    return await pool.query(query);
}