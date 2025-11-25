-- Migración: Agregar columna stripe_price_id a la tabla services
-- Ejecutar este SQL en Supabase SQL Editor

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Comentario: Esta columna almacena el Stripe Price ID para usar Adaptive Pricing
-- y mostrar precios en la moneda local del cliente automáticamente

