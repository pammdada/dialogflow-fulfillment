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

// --- Endpoint principal del fulfillment ---
app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const sintomas = req.body.queryResult.queryText;

  let respuesta = "";
  const especialidades = detectarEspecialidad(sintomas);

  if (intent === "describir-sintoma") {
    if (especialidades.length === 1) {
      respuesta = `Por lo que mencionas, lo más adecuado sería consultar con **${especialidades[0]}**. ¿Quieres que te agende una cita?`;
    } else {
      respuesta = `Tus síntomas podrían estar relacionados con **${especialidades.join(" o ")}**. ¿Quieres que te recomiende por cuál empezar?`;
    }
  } else {
    respuesta = "¿Podrías contarme un poco más sobre tus síntomas?";
  }

  return res.json({
    fulfillmentText: respuesta
  });
});

// Puerto dinámico
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Fulfillment activo en el puerto ${PORT}`));
