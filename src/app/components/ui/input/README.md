# Input Component

Componente reutilizable de campo de texto para formularios, compatible con formularios reactivos y `ngModel`.

## Uso

```html
<!-- Básico -->
<app-input label="Nombre completo" placeholder="Ej. Juan Pérez" [(ngModel)]="nombre"></app-input>

<!-- Con Icono -->
<app-input label="Búsqueda" placeholder="Buscar cliente..." [hasIcon]="true" [(ngModel)]="busqueda">
  <svg icon class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
  </svg>
</app-input>

<!-- Con Error -->
<app-input label="CURP" placeholder="Ingrese CURP" error="El CURP ingresado ya existe" [(ngModel)]="curp"></app-input>
```

## Props

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `''` | Texto que acompaña al input. |
| `placeholder` | `string` | `''` | Texto de ayuda. |
| `type` | `string` | `'text'` | Tipo nativo HTML (`text`, `email`, `password`). |
| `id` | `string` | `(random)` | ID para vincular con el label de forma accesible. |
| `error` | `string` | `''` | Si contiene un texto, cambia el estado visual a rojo y muestra el mensaje debajo. |
| `hasIcon` | `boolean` | `false` | Modifica el padding interno para hacer espacio al icono inyectado vía `<ng-content select="[icon]">`. |
| `disabled` | `boolean` | `false` | Deshabilita el input. |

## Accesibilidad
- Automáticamente relaciona el `label` con el `input` mediante el `id`.
- Los errores son indicados visualmente de acuerdo a los estándares de Flowbite.
