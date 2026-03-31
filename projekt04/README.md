npm install morgan
npm install argon2 //jesli sa problemy to rozniez npm audit fix
npm install  cookie parser
npm install dotenv

> chmod a+x utils/generate_env.sh
> utils/generate_env.sh > .env
> node --watch --env-file .env ./index.js

--konfiguracja-- -sklonuj repozytorium https://github.com/natazari/pzaw_repo.git na swój komputer - git clone https://github.com/natazari/pzaw_repo.git 
-poprzez terminal wejdź w folder projekt04 - cd projekt04 
-jeli nie masz zainstalowanych to w terminalu: npm install morgan, npm install argon2, (jesli sa problemy to rozniez npm audit fix), npm install  cookie parser, npm install dotenv
-stworzyc .env: chmod a+x utils/generate_env.sh, utils/generate_env.sh > .env
-dodaj dane do tablicy - node utils/populate_db.js 
-uruchom serwer - node index.js albo node --watch --env-file .env ./index.js 
-otwórz stronę localhost w przeglądarce

Wyświetlą się kolekcje muzyczne, po kliknięciu wyświetlą się artyści, którzy znajdują sie w kolekcji. Można edytować kolekcję, czyli nazwę kolekcji i artystów. Po kliknięciu w konkretnego artystę wyświetą się tytuły piosenek i ich albumy. Można edytować piosenki po kliknięciu w "edytuj artystę". Poniżej można wypełnić pola danymi i dodać nową piosenkę, dodana zostanie również do bazy danych, co oznacza, że po ponownym uruchomieniu serwera dodane piosenki nadal tam będą.
Można się zarejestrować i zalogować na stronę, żeby kolekcje stworzone przez danego użytkownika nie byly edytowalne dla innnych
