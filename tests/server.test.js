const request = require('supertest'); // v7.0.0
const app = require('../src/server'); // Updated path
const { appendToSheet } = require('../src/utils/googleSheets'); // Import for unit testing
const { google } = require('googleapis'); // For mocking

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

describe('appendToSheet Function', () => {
  const mockContact = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: '+1234567890',
    message: 'Debug append',
  };

  // Mock Google Sheets API to avoid real calls during tests
  let mockSheets;
  beforeEach(() => {
    mockSheets = {
      spreadsheets: {
        values: {
          append: jest.fn().mockResolvedValue({ data: { updates: { updatedRows: 1 } } }),
        },
      },
    };
    jest.spyOn(google, 'sheets').mockReturnValue(mockSheets);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should append data to Google Sheets successfully', async () => {
    await appendToSheet(mockContact);
    expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith(expect.objectContaining({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Contacts',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: expect.arrayContaining([
          expect.arrayContaining([
            expect.any(String), // Timestamp
            'Test',
            'User',
            'test@example.com',
            '+1234567890',
            'Debug append',
          ]),
        ]),
      },
    }));
  });

  it('should handle errors gracefully', async () => {
    mockSheets.spreadsheets.values.append.mockRejectedValue(new Error('Mock API error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await appendToSheet(mockContact);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Google Sheets append failed:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});