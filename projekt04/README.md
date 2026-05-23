Kolekcje muzyczne
Ta strona służy do organizacji swoich kolekcji muzycznych, ale roznież przeglądania kolekcji stworzonych przez innych użytkowników. 
Przeglądanie kolekcji jest dozwolone bez zalogowania. Aby dodawać, edytować i usuwać własne kolekcje trzeba się zalogować lub zarejestrować.

--Konfiguracja:
git clone https://github.com/natazari/pzaw_repo.git

cd projekt04 

npm install

npm run generate_env

npm run populate_db

http://localhost:8000


Konta automatycznie tworzone:
login: admin    hasło: changeme
login: student  hasło: changeme

--Upoważnienia:


| CZYNNOŚĆ                                  | KTO JEST UPOWAŻNIONY                                        |
| -------------                             | -------------                                               |
| Przeglądanie kolekcji                     | Wszyscy                                                     |
| Tworzenie, edytowanie, usuwanie  kolekcji | Zalogowani użytkownicy                                      |
| Dodawanie, edytowanie, usuwanie artystów  | Zalogowani użytkownicy, którzy są autorami kolekcji, admin  |
| Dodawanie, edytowanie, usuwanie piosenek  | Zalogowani użytkownicy, którzy są autorami kolekcji, admin  |

