git add .
git commit -m "Email backend config"
git push origin main

git add .
git commit -m "Fix CORS for frontend origin"
git push heroku main
git push origin main

node backends/server-mongo.js

/Users/franciscoostolaza/luxioncircle-website/public/index.html

cp -r public/css/* .

cp -r public/images/* .

curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"first_name":"Test","last_name":"User","email":"test@example.com","phone":"+123","message":"Hello"}'

heroku logs --tail --app luxion-backend

Set SMTP Env Vars on Heroku:
heroku config:set SMTP_USER=noreply@myprojectrunway.com --app luxion-backend
heroku config:set SMTP_PASS=yy69wqHSPe3c --app luxion-backend