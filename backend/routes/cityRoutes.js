const { Router } = require('express')
const cityController = require('../controllers/cityController')

const router = Router()

router.get('/search', (req, res) => cityController.search(req, res))
router.get('/nearby', (req, res) => cityController.getNearby(req, res))

module.exports = router
