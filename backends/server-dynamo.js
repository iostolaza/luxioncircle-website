require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const nodemailer = require('nodemailer');
const mjml2html = require('mjml');
const { v4: uuidv4 } = require('uuid'); // Add uuid for ID; npm install uuid
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
// AWS DynamoDB setup
const ddbClient = new DynamoDBClient({
region: process.env.AWS_REGION,
credentials: {
accessKeyId: process.env.AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
// Email transporter (same as above)
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
    }
});
// MJML email template (same as above)
function generateConfirmationEmail(name, email) {
const mjmlTemplate = `
        <mjml>
            <mj-body background-color="#FFFDF9">
                <mj-section>
                    <mj-column>
                        <mj-text font-size="20px" color="#003366">Thank You, ${name}!</mj-text>
                        <mj-text>We have received your information and will get back to you soon.</mj-text>
                    </mj-column>
                </mj-section>
            </mj-body>
        </mjml>
    `;
const { html } = mjml2html(mjmlTemplate);
return html;
}
// Form submission route
app.post('/api/contact', [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('message').trim().notEmpty()
], async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
    }
const { name, email, message } = req.body;
const id = uuidv4();
const params = {
TableName: process.env.DYNAMO_TABLE_NAME,
Item: {
id: { S: id },
name: { S: name },
email: { S: email },
message: { S: message },
date: { S: new Date().toISOString() }
        }
    };
try {
// Store in DynamoDB
await ddbClient.send(new PutItemCommand(params));
// Send confirmation email
const html = generateConfirmationEmail(name, email);
await transporter.sendMail({
from: process.env.EMAIL_USER,
to: email,
subject: 'Confirmation: Information Received',
            html
        });
        res.status(200).json({ message: 'Success' });
    } catch (err) {
console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Serve other pages
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/../public/index.html');
});
app.listen(port, () => {
console.log(`Dynamo backend running on http://localhost:${port}`);
});
