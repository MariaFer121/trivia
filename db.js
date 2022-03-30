const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'trivia',
    password: '1234',
    max: 12,
    min: 2,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 2000
})


async function get_user(email) {
    const client = await pool.connect()
    if (!email) {
        const { rows } = await client.query({
            text: 'select * from users ',

        })
        client.release()
        return rows
    } else {
        const { rows } = await client.query({
            text: 'select * from users where email=$1',
            values: [email]
        })
        client.release()
        return rows[0]

    }
}

async function create_user(name, email, password) {
    const client = await pool.connect()
    const user = await get_user();
    if (user.length == 0) {

        await client.query({
            text: `insert into users (name, email, password,es_admin) values ($1, $2, $3,'true')`,
            values: [name, email, password]
        })

        client.release()
    } else {

        await client.query({
            text: 'insert into users (name, email, password) values ($1, $2, $3)',
            values: [name, email, password]
        })

        client.release()
    }
}

async function create_question(question) {
    const client = await pool.connect();
    await client.query({
        text: `insert into questions(question,correct,fake_1,fake_2) values ($1,$2,$3,$4) `,
        values: [question.pregunta, question.correcta, question.erronea1, question.erronea2]
    })
}

async function get_random() {
    const client = await pool.connect()
    const { rows } = await client.query('select * from questions order by random() limit 3')
    client.release()
    return rows
}
async function insert_games(user_id, score) {
    const client = await pool.connect()
    await client.query({
        text: 'insert into points(user_id,score)values($1,$2)',
        values: [user_id, score]
    })
    client.release()
}

async function query_answer(answer) {
    const client = await pool.connect()
    const { rows } = await client.query({
        text: 'select * from questions where correct=$1',
        values: [answer]
    })
    client.release()
    return rows
}

async function get_game() {
    const client = await pool.connect()

    const { rows } = await client.query({
        text: 'select users.name, point.score from points join users on point.id_user=users.id'
    })
    client.release()
    return rows
}

async function validation(data) {
    let score = 0
    let validation_answer = 0
    const answer = Object.values(data)
    for (let i = 0; i < answer.length; i++) {
        validation_answer = await query_answer(answer[i])
        score += validation_answer.length
    }
    return score
}

module.exports = {
    get_user,
    create_user,
    create_question,
    get_random,
    insert_games,
    query_answer,
    get_game,
    validation
}