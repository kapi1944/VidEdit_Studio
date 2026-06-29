# Zasady kodowania

## Nazewnictwo

- Funkcje, zmienne, typy, komponenty i komentarze zapisujemy po polsku.
- Identyfikatory kodu, importy i nazwy plików nie używają znaków diakrytycznych.
- Typy zapisujemy w stylu PascalCase, na przykład `ProjektMontazu`.
- Funkcje i zmienne zapisujemy w stylu camelCase, na przykład `utworzPustyProjekt`.
- Komponenty React zapisujemy po polsku z podkreśleniami między członami nazwy, na przykład `Panel_Osi_Czasu`.

## UTF-8

Projekt używa UTF-8. Polskie znaki są dozwolone w tekstach interfejsu, dokumentacji, komunikatach błędów, logach, plikach JSON i przyszłych treściach użytkownika.

## Testy

Testy dodajemy od początku dla logiki domenowej, walidacji i przeliczeń czasu. Opisy testów piszemy po polsku.

## Separacja logiki

- UI prezentuje dane i obsługuje interakcje.
- Domena zawiera czystą logikę i walidację.
- Infrastruktura zawiera integracje z zewnętrznymi narzędziami.
- Logika przetwarzania audio/wideo nie trafia bezpośrednio do komponentów React.
