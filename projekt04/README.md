npm install morgan
npm install argon2 //jesli sa problemy to rozniez npm audit fix
npm install  cookie parser


> chmod a+x utils/generate_env.sh
> utils/generate_env.sh > .env
> node --watch --env-file .env ./index.js
