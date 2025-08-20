const request = require('supertest'); // v7.0.0
const app = require('../src/server'); // Updated path

describe('Contact API', () => {
  it('should save contact and send email', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        message: 'Hello',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Success');
  });
  it('should validate inputs', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ email: 'invalid' });
    expect(res.statusCode).toEqual(400);
  });
});