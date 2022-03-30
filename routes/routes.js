const express = require('express')
const { get_random, create_question, get_game, insert_games, validation } = require('../db.js')

const router = express.Router()

function protected_route(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next()
}

function role_admin(req, res, next) {
    if (req.session.user.es_admin == false) {
        //   // si quiere trabajar sin rutas prptegidas, comente la siguiente línea
        req.flash('errors', 'Solo el administrador puede crear preguntas')
        return res.redirect('/')
    }
    // console.log(req.session.user.es_admin)
    next()
}

// RUTAS
router.get('/', protected_route, async(req, res) => {
    const errors = req.flash('errors')
    const mensajes = req.flash('mensajes')
    const games = await get_game()
    res.render('index.html', { errors, games, mensajes })
})

router.get('/seguidos', protected_route, role_admin, async(req, res) => {
    res.render('seguidos.html', {})
})

router.get('/play', protected_route, async(rec, res) => {
    const question = await get_random()
    question.map(question => {
        const answers = [question.correct, question.fake_1, question.fake_2]
        question.answers = answers.sort((a, b) => 0.5 - Math.random())
    })

    res.render('play.html', { question })
})

router.post('/play/:user_id/', protected_route, async(req, res) => {
    const points = await validation(req.body);
    const percentage = Math.round((points * 100) / 3)
    await insert_games(req.params.user_id, points)
    req.flash('mensajes', `Su puntaje es ${points}/3 (${percentage}%)`)
    res.redirect('/')
})

router.post('/seguidos', async(req, res) => {
    const question = req.body.question
    const correct = req.body.correct
    const error1 = req.body.error1
    const error2 = req.body.error2
    await create_question(question, correct, error1, error2)
    res.redirect('/seguidos')
});



module.exports = router