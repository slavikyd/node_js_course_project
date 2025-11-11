const assert = require('assert');
const auth = require('../../app/middleware/auth');
const mockHttp = require('node-mocks-http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Auth Middleware', function () {
    it('should call next() when valid token is provided', function (done) {
    const token = jwt.sign({ userId: '123' }, jwtSecret, { expiresIn: '1h' });
    const req = mockHttp.createRequest({
        headers: { authorization: `Bearer ${token}` }
    });
    const res = mockHttp.createResponse();

    auth(req, res, function next(err) {
        try {
        if (err) return done(err);
        assert.ok(req.user);
        done();  
        } catch (error) {
        done(error);
        }
    });
    });


  it('should return 401 when token is missing', function () {
    const req = mockHttp.createRequest();
    const res = mockHttp.createResponse();

    auth(req, res, () => {});
    assert.strictEqual(res.statusCode, 401);
  });

  it('should return 401 when token is invalid', function () {
    const req = mockHttp.createRequest({
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    });
    const res = mockHttp.createResponse();

    auth(req, res, () => {});
    assert.strictEqual(res.statusCode, 401);
  });
});
