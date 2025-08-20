
git status 

git add .

git status

git commit -m "backend server.js config"

git push origin main
git push heroku main


node backends/server-mongo.js

/Users/franciscoostolaza/luxioncircle-website/public/index.html

cp -r public/css/* .

cp -r public/images/* .

curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"first_name":"Francisco","last_name":"Ostolaza","email":"i.ostolaza87@gmail.com","phone":"+4158669595","message":"Hello"}'

heroku logs --tail --app luxion-backend

Set SMTP Env Vars on Heroku:
heroku config:set SMTP_USER=noreply@myprojectrunway.com --app luxion-backend
heroku config:set SMTP_PASS=yy69wqHSPe3c --app luxion-backend

rm -rf node_modules package-lock.json

rm -rf node_modules/.cache

npm install 