const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// --- Lógica de recomendación de especialidad ---
function detectarEspecialidad(sintomas) {
  const texto = sintomas.toLowerCase();

  if (texto.includes("dolor de pecho") || texto.includes("palpitaciones")) {
    return ["Cardiología"];
  }
  if (texto.includes("tos") || texto.includes("falta de aire") || texto.includes("dificultad para respirar")) {
    return ["Neumología", "Medicina General"];
  }
  if (texto.includes("dolor de cabeza") || texto.includes("mareo")) {
    return ["Neurología", "Medicina General"];
  }
  if (texto.includes("sarpullido") || texto.includes("picazón") || texto.includes("manchas en la piel")) {
    return ["Dermatología"];
  }
  if (texto.includes("visión borrosa") || texto.includes("ojos")) {
    return ["Oftalmología"];
  }
  if (texto.includes("ansiedad") || texto.includes("tristeza") || texto.includes("insomnio")) {
    return ["Psiquiatría"];
  }
  if (texto.includes("dolor abdominal") || texto.includes("náusea") || texto.includes("vómito")) {
    return ["Gastroenterología", "Medicina General"];
  }

  return ["Medicina General"];
}

// --- Fulfillment principal ---
app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const sintomas = req.body.queryResult.queryText;
  const parametros = req.body.queryResult.parameters || {};
  const fecha = parametros["fecha"];
  let respuesta = "";

  console.log("👉 Intent recibido:", intent);
  console.log("🗣️ Texto del usuario:", sintomas);

  // --- Intent: describir-sintoma ---
  if (intent === "Describir-sintoma") {
    const especialidades = detectarEspecialidad(sintomas);

    if (especialidades.length === 1) {
      respuesta = `Por lo que mencionas, lo más adecuado sería consultar con ${especialidades[0]}. ¿Quieres que te ayude a agendar una cita?`;
    } else {
      respuesta = `Tus síntomas podrían estar relacionados con ${especialidades.join(" o ")}. ¿Quieres que te recomiende por cuál empezar?`;
    }

    // Mandamos contexto para indicar que ya se identificó una especialidad
    return res.json({
      fulfillmentText: respuesta,
      outputContexts: [
        {
          name: `${req.body.session}/contexts/especialidad_definida`,
          lifespanCount: 3
        }
      ]
    });
  }

  // --- Intent: confirmar-especialidad ---
  if (intent === "Confirmar-especialidad") {
    respuesta = "Perfecto 👍, puedo ayudarte a agendar tu cita. ¿Para qué día te gustaría?";
    return res.json({
      fulfillmentText: respuesta,
      outputContexts: [
        {
          name: `${req.body.session}/contexts/esperando_fecha`,
          lifespanCount: 2
        }
      ]
    });
  }

  // --- Intent: reservar-cita ---
  if (intent === "Reservar-cita") {
    respuesta = "Genial 😊. ¿Para qué día te gustaría la cita?";
    return res.json({
      fulfillmentText: respuesta,
      outputContexts: [
        {
          name: `${req.body.session}/contexts/esperando_fecha`,
          lifespanCount: 2
        }
      ]
    });
  }

  // --- Intent: elegir-fecha ---
  if (intent === "Elegir-fecha") {
    respuesta = `Perfecto ✅, tu cita ha sido registrada para ${fecha}. ¡Te esperamos!`;
    return res.json({
      fulfillmentText: respuesta
    });
  }

  // --- Intent: reserva sin especialidad ---
  if (intent === "Reservar-sin-especialidad") {
    respuesta = "Claro 😊, antes de agendar necesito saber qué síntomas tienes para recomendarte con qué especialista agendar.";
    return res.json({
      fulfillmentText: respuesta
    });
  }

  // --- Si no coincide con ningún intent ---
  respuesta = "¿Podrías contarme un poco más sobre tus síntomas?";
  return res.json({ fulfillmentText: respuesta });
});

// --- Puerto dinámico ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Fulfillment activo en el puerto ${PORT}`));
