const cors = require('../middlewares/cors')

describe('cors middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = { setHeader: jest.fn() }
    next = jest.fn()
  })

  it('définit le header Access-Control-Allow-Origin à *', () => {
    cors(req, res, next)
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
  })

  it('appelle next()', () => {
    cors(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
  })
})
