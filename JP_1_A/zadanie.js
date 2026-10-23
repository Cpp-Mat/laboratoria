/* DANE ZADANIA: edytuj grupy, sloty i klocki. Instrukcja: INSTRUKCJA.md. */
window.MATCHING_TASK = {
  "id": "JP_1_A",
  "eyebrow": "ZMIENNE I TYPY / 02 · RODZINY TYPÓW",
  "heading": "Każdy typ ma",
  "accent": "swoje miejsce.",
  "description": "Dopasuj nazwy typów C++ do trzech rodzin. Wśród typów całkowitych rozróżnij typy ze znakiem i bez znaku. Każdy klocek wykorzystaj raz; kolejność w obrębie kategorii nie ma znaczenia.",
  "backLink": "../index.html#01_podstawy",
  "defaultMode": "help",
  "groups": [
    {
      "id": "logical",
      "title": "Logiczne",
      "description": "Dwie wartości: prawda lub fałsz.",
      "slots": [
        {
          "id": "bool",
          "title": "Typ logiczny"
        }
      ]
    },
    {
      "id": "integer",
      "title": "Całkowite",
      "description": "W tym ćwiczeniu: standardowe typy całkowite ze znakiem i bez znaku.",
      "slots": [
        {
          "id": "signed",
          "title": "Ze znakiem",
          "description": "Liczby ujemne, zero i dodatnie."
        },
        {
          "id": "unsigned",
          "title": "Bez znaku",
          "description": "Zero i liczby dodatnie."
        }
      ]
    },
    {
      "id": "floating",
      "title": "Zmiennoprzecinkowe",
      "description": "Do reprezentowania liczb z częścią ułamkową, z ograniczoną precyzją.",
      "slots": [
        {
          "id": "float",
          "title": "Typy zmiennoprzecinkowe"
        }
      ]
    }
  ],
  "notes": [
    "To podział dydaktyczny: bool umieszczamy osobno ze względu na zastosowanie logiczne. W formalnej klasyfikacji C++ bool również należy do typów całkowitych (integral types).",
    "Zwykły char jest odrębnym typem, a jego znakowość zależy od implementacji. Dlatego nie ma go w tej podstawowej wersji. signed char i unsigned char mają jawnie określoną znakowość.",
    "short oznacza short int, long — long int, a long long — long long int. Brak słowa signed przy tych typach oraz przy int nie oznacza typu bez znaku.",
    "Nie dopasowujemy tutaj rozmiarów ani zakresów. Zadanie nie zależy od konkretnej architektury czy kompilatora."
  ],
  "source": {
    "label": "Podstawa: projekt standardu C++ — typy podstawowe",
    "url": "https://eel.is/c++draft/basic.fundamental"
  },
  "items": [
    {
      "id": "boolType",
      "label": "bool",
      "accepts": [
        "bool"
      ],
      "explanation": "bool służy do przechowywania true i false. W tym podziale ma własną kategorię logiczną."
    },
    {
      "id": "signed0",
      "label": "signed char",
      "accepts": [
        "signed"
      ],
      "explanation": "signed char jest standardowym typem całkowitym ze znakiem. Może reprezentować wartości ujemne, zero i dodatnie."
    },
    {
      "id": "signed1",
      "label": "short",
      "accepts": [
        "signed"
      ],
      "explanation": "short jest standardowym typem całkowitym ze znakiem. Może reprezentować wartości ujemne, zero i dodatnie."
    },
    {
      "id": "signed2",
      "label": "int",
      "accepts": [
        "signed"
      ],
      "explanation": "int jest standardowym typem całkowitym ze znakiem. Może reprezentować wartości ujemne, zero i dodatnie."
    },
    {
      "id": "signed3",
      "label": "long",
      "accepts": [
        "signed"
      ],
      "explanation": "long jest standardowym typem całkowitym ze znakiem. Może reprezentować wartości ujemne, zero i dodatnie."
    },
    {
      "id": "signed4",
      "label": "long long",
      "accepts": [
        "signed"
      ],
      "explanation": "long long jest standardowym typem całkowitym ze znakiem. Może reprezentować wartości ujemne, zero i dodatnie."
    },
    {
      "id": "unsigned0",
      "label": "unsigned char",
      "accepts": [
        "unsigned"
      ],
      "explanation": "Słowo unsigned wskazuje typ całkowity bez znaku. Reprezentuje zero i wartości dodatnie."
    },
    {
      "id": "unsigned1",
      "label": "unsigned short",
      "accepts": [
        "unsigned"
      ],
      "explanation": "Słowo unsigned wskazuje typ całkowity bez znaku. Reprezentuje zero i wartości dodatnie."
    },
    {
      "id": "unsigned2",
      "label": "unsigned int",
      "accepts": [
        "unsigned"
      ],
      "explanation": "Słowo unsigned wskazuje typ całkowity bez znaku. Reprezentuje zero i wartości dodatnie."
    },
    {
      "id": "unsigned3",
      "label": "unsigned long",
      "accepts": [
        "unsigned"
      ],
      "explanation": "Słowo unsigned wskazuje typ całkowity bez znaku. Reprezentuje zero i wartości dodatnie."
    },
    {
      "id": "unsigned4",
      "label": "unsigned long long",
      "accepts": [
        "unsigned"
      ],
      "explanation": "Słowo unsigned wskazuje typ całkowity bez znaku. Reprezentuje zero i wartości dodatnie."
    },
    {
      "id": "floating0",
      "label": "float",
      "accepts": [
        "float"
      ],
      "explanation": "float jest typem zmiennoprzecinkowym. Nie należy do kategorii całkowitych; zapisuje liczby z ograniczoną precyzją."
    },
    {
      "id": "floating1",
      "label": "double",
      "accepts": [
        "float"
      ],
      "explanation": "double jest typem zmiennoprzecinkowym. Nie należy do kategorii całkowitych; zapisuje liczby z ograniczoną precyzją."
    },
    {
      "id": "floating2",
      "label": "long double",
      "accepts": [
        "float"
      ],
      "explanation": "long double jest typem zmiennoprzecinkowym. Nie należy do kategorii całkowitych; zapisuje liczby z ograniczoną precyzją."
    }
  ]
};

