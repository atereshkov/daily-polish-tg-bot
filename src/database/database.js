import pg from 'pg';

const pool = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.DATABASE_PORT) || 5432
});

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

export async function isUserExists(tgId) {
    const query = {
        text: 'SELECT EXISTS(SELECT 1 FROM users WHERE tg_id = $1)',
        values: [tgId]
    }
    return await pool.query(query);
}

// user_answers

export async function updateUserAnswers(tgId, isRight) {
    const column = isRight ? 'right_answers' : 'wrong_answers';
    const query = {
        text: `UPDATE user_answers set ${column} = ${column} + 1 WHERE tg_id = $1`,
        values: [tgId]
    }
    return await pool.query(query);
}

// words

export async function getRandomWord() {
    const query = {
        // text: `SELECT * FROM words_ru TABLESAMPLE SYSTEM_ROWS(1)`, // for larget datasets (https://www.postgresql.org/docs/current/tsm-system-rows.html)
        text: `SELECT * FROM words_ru ORDER BY RANDOM() LIMIT 1`, // for small datasets
        values: []
    }
    return await pool.query(query);
}

export async function saveWord(word) {
    const translation1 = word.translations[0];
    const translation2 = word.translations[1];
    const translation3 = word.translations[2];
    const translation4 = word.translations[3];
    const query = {
        text: 'INSERT INTO words_ru(origin, translation1, translation2, translation3, translation4, right_translation) VALUES($1, $2, $3, $4, $5, $6)',
        values: [word.origin, translation1, translation2, translation3, translation4, word.rightTranslation]
    }
    return await pool.query(query);
}