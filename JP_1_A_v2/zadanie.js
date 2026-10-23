/* DANE ZADANIA — grupy, typy i przykładowe literały. */
window.MATCHING_TASK = {
  "id": "JP_1_A_v2",
  "eyebrow": "ZMIENNE I TYPY / 02 · TYPY I LITERAŁY",
  "heading": "Każdy typ ma",
  "accent": "swoje miejsce.",
  "description": "Przyporządkuj typy C++ do rodzin, a następnie do każdego typu dopasuj przykład literału z dolnego banku. Możesz łączyć literały z typami jeszcze przed umieszczeniem ich w grupach. Przenosząc typ, przenosisz także przypisany literał.",
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
    "Nie dopasowujemy tutaj rozmiarów ani zakresów. Zadanie nie zależy od konkretnej architektury czy kompilatora.",
    "Uwaga: przypisanie literałów to dobór przykładowych wartości do inicjalizacji zmiennych, a nie stwierdzenie, że sam literał zawsze ma ten sam typ co zmienna. Przykładowo 100 ma typ int, mimo że może inicjalizować signed char; 60000 może inicjalizować unsigned short.",
    "Nie wszystkie typy mają własny przyrostek literału: istnieją m.in. U, L, LL, F, ale nie ma standardowych przyrostków dla signed char, short ani unsigned short. Wartości i dopasowania dla podstawowych typów całkowitych dobrano do typowej 32-/64-bitowej platformy dydaktycznej (np. MinGW na Windows).",
    "W tym ćwiczeniu dla przejrzystości przyjęto po jednej reprezentatywnej parze typ–literał. W rzeczywistym C++ część literałów może prawidłowo inicjalizować kilka różnych typów. To zadanie sprawdza wzorcowe pary, a nie wszystkie dozwolone konwersje.",
    "Zapis z minusem (np. -5) jest wyrażeniem z operatorem jednoargumentowym −, a nie jednym literałem. Dlatego w banku użyto literałów nieujemnych."
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
  ],
  "literals": [
    {
      "id": "litBool",
      "label": "true",
      "accepts": [
        "boolType"
      ],
      "explanation": "true jest literałem logicznym typu bool."
    },
    {
      "id": "litSChar",
      "label": "100",
      "accepts": [
        "signed0"
      ],
      "explanation": "100 jest literałem całkowitym (int), a jego wartość mieści się w signed char. Nie istnieje osobny przyrostek literału dla signed char."
    },
    {
      "id": "litShort",
      "label": "12345",
      "accepts": [
        "signed1"
      ],
      "explanation": "12345 jest literałem typu int; wartość mieści się w short. Nie istnieje przyrostek literału short."
    },
    {
      "id": "litInt",
      "label": "123456",
      "accepts": [
        "signed2"
      ],
      "explanation": "123456 jest literałem typu int na typowych platformach 32-/64-bitowych."
    },
    {
      "id": "litLong",
      "label": "2000000000L",
      "accepts": [
        "signed3"
      ],
      "explanation": "Przyrostek L oznacza literał całkowity typu long, jeśli wartość mieści się w jego zakresie."
    },
    {
      "id": "litLongLong",
      "label": "5000000000LL",
      "accepts": [
        "signed4"
      ],
      "explanation": "Przyrostek LL oznacza literał typu long long."
    },
    {
      "id": "litUChar",
      "label": "200",
      "accepts": [
        "unsigned0"
      ],
      "explanation": "200 może inicjalizować unsigned char (co najmniej 8 bitów), ale nie signed char o typowym zakresie −128…127."
    },
    {
      "id": "litUShort",
      "label": "60000",
      "accepts": [
        "unsigned1"
      ],
      "explanation": "60000 mieści się w unsigned short o co najmniej 16 bitach. Sam literał jest typu int na typowych platformach."
    },
    {
      "id": "litUInt",
      "label": "3000000000U",
      "accepts": [
        "unsigned2"
      ],
      "explanation": "Przyrostek U oznacza typ unsigned int, jeśli wartość mieści się w jego zakresie (typowo 32 bity)."
    },
    {
      "id": "litULong",
      "label": "4000000000UL",
      "accepts": [
        "unsigned3"
      ],
      "explanation": "Przyrostek UL oznacza unsigned long, jeśli wartość mieści się w jego zakresie."
    },
    {
      "id": "litULongLong",
      "label": "5000000000ULL",
      "accepts": [
        "unsigned4"
      ],
      "explanation": "Przyrostek ULL oznacza unsigned long long."
    },
    {
      "id": "litFloat",
      "label": "1.25f",
      "accepts": [
        "floating0"
      ],
      "explanation": "Przyrostek f nadaje literałowi zmiennoprzecinkowemu typ float."
    },
    {
      "id": "litDouble",
      "label": "1.25",
      "accepts": [
        "floating1"
      ],
      "explanation": "Literał zmiennoprzecinkowy bez przyrostka ma typ double."
    },
    {
      "id": "litLongDouble",
      "label": "1.25L",
      "accepts": [
        "floating2"
      ],
      "explanation": "Przyrostek L nadaje literałowi zmiennoprzecinkowemu typ long double."
    }
  ],
  "literalPairing": "representative"
};
