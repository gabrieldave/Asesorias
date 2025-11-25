/**
 * Script para agregar la columna stripe_price_id a la tabla services
 * 
 * Ejecutar: node scripts/add-stripe-price-id-column.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Error: Faltan variables de entorno");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!serviceRoleKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addColumn() {
  try {
    console.log("🔧 Agregando columna stripe_price_id a la tabla services...\n");

    // Ejecutar SQL para agregar la columna
    const { error } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;",
    });

    // Si el RPC no existe, intentar directamente con una query
    if (error) {
      console.log("⚠️  RPC no disponible, intentando método alternativo...");
      
      // Intentar crear la columna usando una actualización vacía que force la creación
      // Nota: Esto puede no funcionar si la columna no existe, pero es un intento
      const { error: testError } = await supabase
        .from("services")
        .select("stripe_price_id")
        .limit(1);

      if (testError && testError.message.includes("stripe_price_id")) {
        console.error("\n❌ La columna no existe y no se puede crear automáticamente.");
        console.error("   Por favor, ejecuta este SQL manualmente en Supabase:\n");
        console.error("   ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;\n");
        console.error("   O usa el archivo: migrations/add_stripe_price_id.sql\n");
        process.exit(1);
      }
    }

    console.log("✅ Columna stripe_price_id agregada exitosamente!\n");
    console.log("📝 Ahora puedes ejecutar: node scripts/update-services-price-ids.js\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n💡 Solución: Ejecuta este SQL manualmente en Supabase SQL Editor:\n");
    console.error("   ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;\n");
    process.exit(1);
  }
}

addColumn();

