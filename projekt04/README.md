## Kolekcje muzyczne
Ta strona służy do organizacji swoich kolekcji muzycznych, ale roznież przeglądania kolekcji stworzonych przez innych użytkowników. 
Przeglądanie kolekcji jest dozwolone bez zalogowania. Aby dodawać, edytować i usuwać własne kolekcje trzeba się zalogować lub zarejestrować.

## Konfiguracja:
git clone https://github.com/natazari/pzaw_repo.git

cd pzaw_repo

cd projekt04 

npm install

npm run generate_env

npm run populate_db

node index.js

http://localhost:8000


Konta automatycznie tworzone:
login: admin    hasło: changeme
login: student  hasło: changeme

## Upoważnienia:


| CZYNNOŚĆ                                  | KTO JEST UPOWAŻNIONY                                        |
| -------------                             | -------------                                               |
| Przeglądanie kolekcji                     | Wszyscy                                                     |
| Tworzenie, edytowanie, usuwanie  kolekcji | Zalogowani użytkownicy                                      |
| Dodawanie, edytowanie, usuwanie artystów  | Zalogowani użytkownicy, którzy są autorami kolekcji, admin  |
| Dodawanie, edytowanie, usuwanie piosenek  | Zalogowani użytkownicy, którzy są autorami kolekcji, admin  |



## Ścieżki

## Autoryzacja`/auth`
| Metoda | Ścieżka | Opis |
|--------|---------|------|
| GET | `/auth/signup` | Formularz rejestracji |
| POST | `/auth/signup` | Obsługa rejestracji |
| GET | `/auth/login` | Formularz logowania |
| POST | `/auth/login` | Obsługa logowania |
| GET | `/auth/logout` | Wylogowanie użytkownika |

---

## Kolekcje `/collections`

| Metoda | Ścieżka | Opis | Czy potrzebna autoyzacja |
|--------|---------|------|------|
| GET | `/` lub `/collections` | Lista wszystkich kolekcji | nie |
| GET | `/collections/new_collection` | Formularz nowej kolekcji | tak |
| POST | `/collections/new_collection` | Tworzenie nowej kolekcji | tak|
| GET | `/collections/:collection_id` | Widok pojedynczej kolekcji | nie|
| GET | `/collections/edit/:collection_id` | Formularz edycji kolekcji |  (sprawdza `canEdit`) |
| POST | `/collections/edit/:collection_id` | Zapis edycji kolekcji |  (sprawdza `canEdit`) |

---

## Artyści

| Metoda | Ścieżka | Opis | Czy potrzebna autoyzacja  |
|--------|---------|------|------|
| GET | `/collections/:collection_id/artists/new` | Formularz nowego artysty | tak |
| POST | `/collections/:collection_id/artists` | Tworzenie artysty w kolekcji | tak |
| GET | `/artists/:artist_id` | Widok artysty i jego piosenek | nue |
| POST | `/artists/delete/:artist_id` | Usunięcie artysty | tak |
| POST | `/artists/:artist_id/add_song` | Dodanie piosenki do artysty | tak |
| GET | `/collections/artists/edit/:artist_id` | Formularz edycji artysty | (sprawdza `canEditArtist`) |
| POST | `/collections/artists/edit/:artist_id` | Zapis edycji artysty | (sprawdza `canEditArtist`) |

---

## Piosenki

| Metoda | Ścieżka | Opis | Czy potrzebna autoyzacja  |
|--------|---------|------|------|
| GET | `/songs/edit/:song_id` | Formularz edycji piosenki | tak |
| POST | `/collections/artists/songs/edit/:artist_id/:song_id` | Zapis edycji piosenki | tak |
| POST | `/collections/artists/songs/delete/:artist_id/:song_id` | Usunięcie piosenki | tak |

---
