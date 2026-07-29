# Card Component

Componente reutilizable de Tarjeta para estructurar contenido en bloques lógicos, como resúmenes financieros o perfiles de clientes.

## Uso

```html
<!-- Básico -->
<app-card>
  <p>Contenido sin título pero con padding automático.</p>
</app-card>

<!-- Con Título y Subtítulo -->
<app-card title="Categoría Actual" subtitle="Basado en historial de pagos">
  <span class="text-2xl font-bold text-brand">PLATA 6%</span>
</app-card>

<!-- Sin Padding interno (Ideal para listas edge-to-edge) -->
<app-card [noPadding]="true">
  <ul>
    <li class="p-4 border-b">Elemento 1</li>
    <li class="p-4">Elemento 2</li>
  </ul>
</app-card>
```

## Props

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `''` | Título que se renderiza en la cabecera (separada por borde inferior). |
| `subtitle` | `string` | `''` | Texto secundario ubicado debajo del título. |
| `noPadding` | `boolean` | `false` | Elimina el espacio interno (`p-5`) del contenedor donde se inserta el `ng-content`. |
| `extraClasses` | `string` | `''` | Clases Tailwind adicionales a inyectar en el contenedor raíz del card. |

## Accesibilidad
- Diseño de alto contraste adaptado automáticamente a Dark Mode (si se habilita globalmente).
- Bordes redondeados más orgánicos (`rounded-2xl`) para la app móvil.
