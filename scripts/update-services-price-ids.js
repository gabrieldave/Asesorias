/**
 * Script para actualizar los servicios existentes con sus Stripe Price IDs
 * 
 * Mapeo:
 * - $30 USD → price_1SXOoyG2B99hBCya2bBXCGJu
 * - $50 USD → price_1SXOqXG2B99hBCyaH7yILZPu
 * - $70 USD → price_1SXOrHG2B99hBCyace5eGxc8
 * 
 * Ejecutar: node scripts/update-services-price-ids.js
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

// Mapeo de precios a price_ids
const PRICE_MAPPING = {
  30: "price_1SXOoyG2B99hBCya2bBXCGJu",
  50: "price_1SXOqXG2B99hBCyaH7yILZPu",
  70: "price_1SXOrHG2B99hBCyace5eGxc8",
};

async function updateServices() {
  try {
    console.log("📋 Obteniendo servicios...");
    
    // Obtener todos los servicios
    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("*");

    if (fetchError) {
      console.error("❌ Error al obtener servicios:", fetchError);
      process.exit(1);
    }

    if (!services || services.length === 0) {
      console.log("⚠️  No se encontraron servicios");
      return;
    }

    console.log(`\n📦 Encontrados ${services.length} servicio(s):\n`);

    let updated = 0;
    let skipped = 0;

    for (const service of services) {
      const price = Math.round(service.price);
      const priceId = PRICE_MAPPING[price];

      console.log(`  • ${service.title} ($${price} USD)`);

      if (!priceId) {
        console.log(`    ⚠️  No hay price_id configurado para $${price} USD`);
        skipped++;
        continue;
      }

      if (service.stripe_price_id === priceId) {
        console.log(`    ✅ Ya tiene el price_id correcto: ${priceId}`);
        skipped++;
        continue;
      }

      // Actualizar el servicio
      const { error: updateError } = await supabase
        .from("services")
        .update({
          stripe_price_id: priceId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);

      if (updateError) {
        console.error(`    ❌ Error al actualizar:`, updateError);
        continue;
      }

      console.log(`    ✅ Actualizado con price_id: ${priceId}`);
      updated++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Omitidos: ${skipped}`);
    console.log(`   📦 Total: ${services.length}\n`);

    if (updated > 0) {
      console.log("✨ ¡Servicios actualizados exitosamente!");
    } else {
      console.log("ℹ️  No se requirieron actualizaciones.");
    }
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    process.exit(1);
  }
}

updateServices();

