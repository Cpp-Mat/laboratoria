/* ============================================================
   JP_1_3 — DANE ZADANIA
   Ten plik edytujesz przy tworzeniu kolejnego ćwiczenia.
   Silnik sam ustala liczbę miejsc na podstawie blocks.length.
   Pełna instrukcja i przykłady: INSTRUKCJA.md
   ============================================================ */
window.EXERCISE = {
  // 1. TYTUŁY I TREŚĆ
  id: "JP_1_3",
  eyebrow: "ZMIENNE I TYPY / 01 · WEJŚCIE I WYJŚCIE",
  heading: "Zbuduj program.",
  accent: "Własnymi słowami.",
  description: "Przygotuj zmienną na liczbę, poproś użytkownika o jej podanie, wczytaj ją i wypisz: „Wpisana liczba to:” wraz z wartością. Ułóż działania i obserwuj, jak powstaje odpowiadający im program w C++.",
  backLink: "../index.html#01_podstawy",
  initialMessage: "Zacznij od przygotowania zmiennej albo wyświetlenia prośby o liczbę.",
  successMessage: "Gotowe! Zmienna i prośba poprzedzają odczyt, a wynik pojawia się po wczytaniu.",
  defaultMode: "magnet", // "magnet" lub "free"

  // 2. STAŁA CZĘŚĆ PROGRAMU — poza przestawianymi klockami.
  program: {
    before: ["#include <iostream>", "using namespace std;", "", "int main() {"],
    indent: "    ",
    after: ["    return 0;", "}"]
  },

  // 3. KLOCKI — kolejność wpisów to początkowy układ w banku,
  // NIE wzorcowe rozwiązanie. id jest stałą, unikalną nazwą.
  blocks: [
    {
      id: "print",
      title: "Pokaż zapamiętaną wartość",
      sub: "Wypisz „Wpisana liczba to:” oraz wartość zmiennej.",
      code: 'cout << "Wpisana liczba to: " << liczba << endl;',
      after: ["read"],
      hint: "Nie ma jeszcze wartości do pokazania. Najpierw wczytaj liczbę."
    },
    {
      id: "read",
      title: "Wczytaj i zapamiętaj liczbę",
      sub: "Zapisz wpisaną wartość w zmiennej „liczba”.",
      code: "cin >> liczba;",
      after: ["declare", "prompt"],
      hint: "Przed wczytaniem przygotuj zmienną i poproś użytkownika o liczbę."
    },
    {
      id: "declare",
      title: "Przygotuj zmienną na liczbę",
      sub: "Nazwij ją „liczba”. Typ: liczba rzeczywista.",
      code: "double liczba;"
      // Brak zależności od prompt: oba klocki można zamieniać.
    },
    {
      id: "prompt",
      title: "Poproś użytkownika o liczbę",
      sub: "Wypisz w konsoli: „Wprowadź liczbę”.",
      code: 'cout << "Wprowadź liczbę" << endl;'
    }
  ]
};

