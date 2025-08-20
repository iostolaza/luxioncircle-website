git add .
git commit -m "Mongo serve.js config"
git push origin main

node backends/server-mongo.js

/Users/franciscoostolaza/luxioncircle-website/public/index.html

cp -r public/css/* .

cp -r public/images/* .

curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"first_name":"Test","last_name":"User","email":"test@example.com","phone":"+123","message":"Hello"}'

