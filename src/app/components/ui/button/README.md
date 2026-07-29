# Button Component

Componente reutilizable de botón para estandarizar las llamadas a la acción dentro de la aplicación móvil (Distribuidoras), usando la paleta oficial (Guindo `#600C0C`).

## Uso

```html
<app-button 
  variant="primary" 
  size="lg" 
  [fullWidth]="true" 
  (onClick)="submitForm()">
  Aceptar
</app-button>
```

## Props

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'outline' \| 'danger'` | `'primary'` | Define el estilo visual del botón. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Define el tamaño (padding y fuente). |
| `fullWidth`| `boolean` | `false` | Si es `true`, ocupa el 100% de ancho de su contenedor. |
| `disabled` | `boolean` | `false` | Deshabilita interacciones y baja la opacidad. |
| `type` | `'button' \| 'submit'` | `'button'` | El tipo de botón nativo. |

## Estados (Variantes)

- **Primary:** Botón sólido usando `--color-brand`. Utilizado para CTAs principales.
- **Outline:** Botón con borde `--color-brand` y fondo transparente. Útil para acciones secundarias.
- **Danger:** Botón rojo para acciones destructivas o alertas críticas.

## Buenas Prácticas
- Siempre usar `fullWidth="true"` en la aplicación móvil para facilitar el uso con pulgares ("Touch-friendly").
- Usar el botón en `disabled` cuando se está procesando una solicitud para evitar doble clic.
