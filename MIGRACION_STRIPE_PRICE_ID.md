# Migración: Stripe Price IDs para Adaptive Pricing

## 📋 Resumen

Se ha implementado el uso de Stripe Price IDs para habilitar **Adaptive Pricing**, que permite que los clientes vean y paguen en su moneda local automáticamente.

## 🔧 Pasos para completar la migración

### 1. Agregar columna en Supabase

Ejecuta este SQL en el **Supabase SQL Editor**:

```sql
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
```

**Cómo hacerlo:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Pega el SQL de arriba
4. Haz clic en **Run**

### 2. Actualizar servicios existentes

Una vez agregada la columna, ejecuta el script:

```bash
node scripts/update-services-price-ids.js
```

Este script mapeará automáticamente:
- **$30 USD** → `price_1SXOoyG2B99hBCya2bBXCGJu`
- **$50 USD** → `price_1SXOqXG2B99hBCyaH7yILZPu`
- **$70 USD** → `price_1SXOrHG2B99hBCyace5eGxc8`

## ✅ Cambios implementados

1. **`types/database.types.ts`**: Agregado campo `stripe_price_id` a la interfaz `Service`
2. **`app/api/admin/services/create/route.ts`**: Acepta y guarda `stripe_price_id` al crear/actualizar servicios
3. **`app/api/checkout/create/route.ts`**: Usa `price_id` si está disponible, sino usa `price_data` como fallback
4. **`scripts/update-services-price-ids.js`**: Script para actualizar servicios existentes

## 🎯 Funcionamiento

- Si un servicio tiene `stripe_price_id`, Stripe Checkout usará ese precio (con Adaptive Pricing activado)
- Si no tiene `stripe_price_id`, usará `price_data` como antes (comportamiento de respaldo)
- Los clientes verán automáticamente los precios en su moneda local (MXN, EUR, etc.)

## 📝 Notas

- Los nuevos servicios pueden tener `stripe_price_id` desde el formulario de admin (próximamente)
- Los servicios existentes se actualizan con el script
- Adaptive Pricing debe estar habilitado en tu Stripe Dashboard

