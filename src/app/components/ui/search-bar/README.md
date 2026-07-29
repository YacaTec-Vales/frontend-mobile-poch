# SearchBar Component

Componente especializado para búsqueda dentro de listas y catálogos en la app móvil.

## Uso

```html
<app-search-bar 
  placeholder="Buscar por nombre o CURP" 
  (onSearch)="filterList($event)">
</app-search-bar>
```

## Props

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `placeholder` | `string` | `'Buscar...'` | Texto de ayuda dentro del input. |
| `initialValue` | `string` | `''` | Valor precargado para la búsqueda. Funciona de manera reactiva con el botón de limpieza "X". |

## Outputs

| Evento | Tipo | Descripción |
| :--- | :--- | :--- |
| `onSearch` | `EventEmitter<string>` | Se dispara en cada tecla o cuando se limpia la búsqueda. |

## Accesibilidad
- Íconos descriptivos (Lupa y X).
- El botón de limpieza solo aparece si hay contenido escrito.
