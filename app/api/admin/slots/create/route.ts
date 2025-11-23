import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Función para generar slots recurrentes
function generateRecurringSlots(
  selectedDays: number[],
  startRange: Date,
  endRange: Date,
  startTime: string,
  endTime: string,
  duration: number
): Array<{ start_time: string; end_time: string }> {
  const slots: Array<{ start_time: string; end_time: string }> = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  
  const startDate = new Date(startRange);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(endRange);
  endDate.setHours(23, 59, 59, 999);
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    if (selectedDays.includes(dayOfWeek)) {
      // Crear slots desde startTime hasta endTime con la duración especificada
      let slotStart = new Date(currentDate);
      slotStart.setHours(startHour, startMin, 0, 0);
      
      const slotEndTime = new Date(currentDate);
      slotEndTime.setHours(endHour, endMin, 0, 0);
      
      while (slotStart < slotEndTime) {
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        
        // Solo crear slots que no excedan el horario de fin
        if (slotEnd <= slotEndTime) {
          slots.push({
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString(),
          });
        }
        
        // Mover al siguiente slot
        slotStart = new Date(slotEnd);
      }
    }
    
    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere sesión de administrador." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode, start_time, end_time, service_id } = body;

    const supabase = createServiceRoleClient();

    // Modo recurrente
    if (mode === "recurring") {
      const {
        selectedDays,
        startRange,
        endRange,
        startTime,
        endTime,
        duration,
      } = body;

      if (!selectedDays || !Array.isArray(selectedDays) || selectedDays.length === 0) {
        return NextResponse.json(
          { error: "Debes seleccionar al menos un día de la semana" },
          { status: 400 }
        );
      }

      if (!startRange || !endRange) {
        return NextResponse.json(
          { error: "Debes especificar el rango de fechas" },
          { status: 400 }
        );
      }

      // Validar que startTime < endTime
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startTimeMinutes = startHour * 60 + startMin;
      const endTimeMinutes = endHour * 60 + endMin;

      if (startTimeMinutes >= endTimeMinutes) {
        return NextResponse.json(
          { error: "La hora de inicio debe ser anterior a la hora de fin" },
          { status: 400 }
        );
      }

      // Validar que el rango de fechas sea válido
      const startRangeDate = new Date(startRange);
      const endRangeDate = new Date(endRange);
      
      if (startRangeDate >= endRangeDate) {
        return NextResponse.json(
          { error: "La fecha de inicio debe ser anterior a la fecha de fin" },
          { status: 400 }
        );
      }

      // Generar todos los slots
      const slots = generateRecurringSlots(
        selectedDays,
        startRangeDate,
        endRangeDate,
        startTime,
        endTime,
        duration || 60
      );

      if (slots.length === 0) {
        return NextResponse.json(
          { error: "No se generaron slots con los criterios especificados. Verifica que los días seleccionados existan en el rango de fechas." },
          { status: 400 }
        );
      }

      // Filtrar slots que están en el pasado
      const now = new Date();
      const validSlots = slots.filter((slot) => new Date(slot.start_time) > now);

      if (validSlots.length === 0) {
        return NextResponse.json(
          { error: "Todos los slots generados están en el pasado. Por favor, selecciona fechas futuras." },
          { status: 400 }
        );
      }

      console.log(`📅 Generados ${slots.length} slots, ${validSlots.length} válidos (futuros)`);

      // Limitar a 500 slots por vez para evitar sobrecarga
      if (validSlots.length > 500) {
        return NextResponse.json(
          { error: `Se generarían ${validSlots.length} slots. Por favor, reduce el rango de fechas o días seleccionados. Máximo 500 slots por operación.` },
          { status: 400 }
        );
      }

      // Preparar datos para insertar y validar
      const slotsToInsert = validSlots
        .map((slot) => {
          // Validar que start_time < end_time
          if (new Date(slot.start_time) >= new Date(slot.end_time)) {
            return null;
          }
          return {
            start_time: slot.start_time,
            end_time: slot.end_time,
            service_id: service_id || null,
            is_booked: false,
          };
        })
        .filter((slot) => slot !== null);

      if (slotsToInsert.length === 0) {
        return NextResponse.json(
          { error: "No se generaron slots válidos con los criterios especificados" },
          { status: 400 }
        );
      }

      console.log(`📦 Intentando insertar ${slotsToInsert.length} slots...`);

      // Insertar todos los slots en lotes de 100 para evitar problemas
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < slotsToInsert.length; i += batchSize) {
        batches.push(slotsToInsert.slice(i, i + batchSize));
      }

      const allInsertedSlots: any[] = [];
      let hasError = false;
      let lastError: any = null;

      for (const batch of batches) {
        const { data, error } = await (supabase.from("availability_slots") as any)
          .insert(batch)
          .select();

        if (error) {
          console.error("Error creating recurring slots batch:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          hasError = true;
          lastError = error;
          break;
        }

        if (data) {
          allInsertedSlots.push(...data);
        }
      }

      if (hasError) {
        const errorMessage = lastError?.message || lastError?.code || "Error desconocido";
        console.error("Error completo:", lastError);
        return NextResponse.json(
          { 
            error: `Error al crear los slots recurrentes: ${errorMessage}`,
            details: lastError?.details || null
          },
          { status: 500 }
        );
      }

      console.log(`✅ ${allInsertedSlots.length} slots creados exitosamente`);

      return NextResponse.json({
        success: true,
        count: allInsertedSlots.length,
        slots: allInsertedSlots,
      });
    }

    // Modo único (comportamiento original)
    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: "start_time y end_time son requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("availability_slots") as any)
      .insert({
        start_time,
        end_time,
        service_id: service_id || null,
        is_booked: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating slot:", error);
      return NextResponse.json(
        { error: "Error al crear el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slot: data,
      count: 1,
    });
  } catch (error: any) {
    console.error("Error creating slot:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear el slot" },
      { status: 500 }
    );
  }
}
