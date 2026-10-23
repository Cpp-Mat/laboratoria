/* JP_3_5 — DANE UKŁADANKI PARSONSA
   Edytuj ten plik, tworząc kolejne zadanie. Nie jest to silnik JP_1_3.
   Pełna instrukcja: INSTRUKCJA.md.
   Pola z końcówką Html przyjmują własny, zaufany HTML autora.
*/
window.PARSONS_TASK = {
  // 1. TYTUŁY, POLECENIE I KOMUNIKATY
  ui: {
    "id": "JP_3_5",
    "pageTitle": "JP_3_5 · Ułóż program C++",
    "description": "Interaktywna układanka C++ JP_3_5: operacje, warunki i poprawna kolejność instrukcji.",
    "backLink": "../index.html#02_warunki",
    "eyebrow": "Warunki · wejście i wyjście",
    "heading": "Dobry program zaczyna się",
    "headingLead": "od ",
    "accent": "dobrej kolejności.",
    "intro": "Wszystkie potrzebne linie już tu są. Uporządkuj je tak, aby program poprawnie dodawał, odejmował i reagował na błędny znak operacji.",
    "mark": "+ / −",
    "fileName": "main.cpp",
    "footer": "JP_3_5 · Parsons puzzle · C++11 lub nowszy",
    "briefHeadingHtml": "Dwie operacje.<br>Jeden ważny warunek.",
    "requirementsHtml": [
      "Wczytaj znak operacji do zmiennej typu <span class=\"pill\">char</span>.",
      "Dla <span class=\"pill\">+</span> lub <span class=\"pill\">-</span> wczytaj dwie liczby typu <span class=\"pill\">double</span>, wypisz nazwę operacji i wynik.",
      "Dla innego znaku wypisz <span class=\"pill\">Niedozwolona operacja:</span> oraz ten znak. Zakończ program <strong>przed wczytaniem liczb</strong>."
    ],
    "noteHtml": "Wskazówka: znak jest nieprawidłowy, gdy jednocześnie nie jest plusem <strong>i</strong> nie jest minusem.",
    "assessmentHtml": "deklaracje mogą być przed lub po komunikatach <span class=\"pill\">cout</span>, ale muszą poprzedzać odpowiednie <span class=\"pill\">cin</span> i obejmować zakresem wszystkie użycia zmiennych. Można je umieścić bezpośrednio w <span class=\"pill\">main</span> lub przed funkcją jako zmienne globalne. Deklaracja liczb może też poprzedzać walidację znaku. Pozostałe instrukcje porównujemy z wzorcem dydaktycznym. Identyczne klamry i instrukcje <span class=\"pill\">return 0;</span> są zamienne.",
    "numbersHtml": "program używa domyślnego formatowania <span class=\"pill\">cout</span> (6 cyfr znaczących), bez wymuszania dwóch miejsc po przecinku. Nie porównuje wyników typu <span class=\"pill\">double</span> operatorem <span class=\"pill\">==</span>. Zakładamy poprawne dane liczbowe po dozwolonym znaku operacji.",
    "initialMessage": "Ułóż linie od biblioteki do ostatniej klamry. Sprawdź znak operacji przed wczytaniem liczb.",
    "successMessage": "Deklaracje poprzedzają użycie zmiennych i mają właściwy zakres. Nieprawidłowy znak kończy działanie przed wczytaniem liczb, a + i - prowadzą do właściwych obliczeń. Weryfikacja dotyczy kolejności; kompilacja nie jest wykonywana.",
    "revealMessage": "Prześledź warunek z && oraz return 0 przed wczytaniem liczb. Aby spróbować samodzielnie, wybierz „Pomieszaj od nowa”.",
    "exampleNote": "To przykłady wzorcowe, niezależne od ułożenia linii. Liczby wpisuj z kropką dziesiętną."
  },

  // 2. PROGRAM W POPRAWNEJ KOLEJNOŚCI
  // Kolejność wpisów JEST wzorcem. Każda linia ma unikalne id.
  // Identyczne teksty (np. klamry i return 0;) są zamienne.
  lines: [
    {
      "id": "include",
      "code": "#include <iostream>",
      "hint": "Zacznij od biblioteki potrzebnej do cin i cout."
    },
    {
      "id": "namespace",
      "code": "using namespace std;",
      "hint": "Po dołączeniu biblioteki udostępnij nazwy ze std."
    },
    {
      "id": "main",
      "code": "int main() {",
      "hint": "Otwórz funkcję main, zanim umieścisz w niej instrukcje."
    },
    {
      "id": "declareOperation",
      "code": "char operacja;",
      "hint": "Zadeklaruj znak operacji przed jego użyciem."
    },
    {
      "id": "askOperation",
      "code": "cout << \"Podaj operacje (+ lub -): \";",
      "hint": "Najpierw poproś o znak operacji."
    },
    {
      "id": "readOperation",
      "code": "cin >> operacja;",
      "hint": "Wczytaj znak, zanim sprawdzisz jego wartość."
    },
    {
      "id": "validateOperation",
      "code": "if (operacja != '+' && operacja != '-') {",
      "hint": "Teraz sprawdź, czy znak nie jest ani plusem, ani minusem (operator &&)."
    },
    {
      "id": "invalidMessage",
      "code": "cout << \"Niedozwolona operacja: \" << operacja << endl;",
      "hint": "W gałęzi błędnego znaku wypisz komunikat oraz wczytany znak."
    },
    {
      "id": "invalidReturn",
      "code": "return 0;",
      "hint": "Po komunikacie błędu zakończ program, zanim wczytasz liczby."
    },
    {
      "id": "invalidEnd",
      "code": "}",
      "hint": "Zamknij blok obsługi niedozwolonej operacji."
    },
    {
      "id": "declareNumbers",
      "code": "double pierwsza, druga;",
      "hint": "Dla dozwolonej operacji przygotuj dwie zmienne typu double."
    },
    {
      "id": "askNumbers",
      "code": "cout << \"Podaj dwie liczby: \";",
      "hint": "Po walidacji znaku poproś o dwie liczby."
    },
    {
      "id": "readNumbers",
      "code": "cin >> pierwsza >> druga;",
      "hint": "Wczytaj obie liczby, zanim wykonasz działanie."
    },
    {
      "id": "chooseOperation",
      "code": "if (operacja == '+') {",
      "hint": "Po wczytaniu liczb sprawdź, czy wybrano dodawanie."
    },
    {
      "id": "sum",
      "code": "cout << \"Wykonuje dodawanie, suma to: \" << pierwsza + druga << endl;",
      "hint": "W gałęzi plusa wypisz nazwę operacji i sumę."
    },
    {
      "id": "otherwise",
      "code": "} else {",
      "hint": "Gałąź else obsługuje minus: inne znaki zostały już odrzucone."
    },
    {
      "id": "difference",
      "code": "cout << \"Wykonuje odejmowanie, roznica to: \" << pierwsza - druga << endl;",
      "hint": "W gałęzi else wypisz nazwę operacji i różnicę pierwsza - druga."
    },
    {
      "id": "choiceEnd",
      "code": "}",
      "hint": "Zamknij warunek wyboru działania."
    },
    {
      "id": "mainReturn",
      "code": "return 0;",
      "hint": "Po wykonaniu działania zakończ funkcję main."
    },
    {
      "id": "mainEnd",
      "code": "}",
      "hint": "Na końcu zamknij funkcję main."
    }
  ],

  // 3. WYJĄTKI: RUCHOME DEKLARACJE
  // line = id deklaracji; before = id pierwszego wymaganego użycia.
  // maxDepth: 1 dopuszcza poziom globalny (0) i main (1), ale nie if (2).
  declarations: [
    {
      "line": "declareOperation",
      "before": "readOperation",
      "names": "operacja",
      "maxDepth": 1
    },
    {
      "line": "declareNumbers",
      "before": "readNumbers",
      "names": "pierwsza i druga",
      "maxDepth": 1
    }
  ],

  // 4. WZORCOWE PRZYKŁADY — zwykły tekst, bez uruchamiania C++.
  // Usuń wszystkie wpisy (examples: []), aby ukryć cały panel.
  examples: [
    {
      "id": "plus",
      "label": "+ Dodaj",
      "input": "+\n12.2 4.44",
      "output": "Wykonuje dodawanie, suma to: 16.64"
    },
    {
      "id": "minus",
      "label": "− Odejmij",
      "input": "-\n3.14 2.03",
      "output": "Wykonuje odejmowanie, roznica to: 1.11"
    },
    {
      "id": "invalid",
      "label": "* Błąd",
      "input": "*\n(bez podawania liczb)",
      "output": "Niedozwolona operacja: *"
    }
  ],

  // 5. WYGLĄD KODU
  indent: "    "
};

