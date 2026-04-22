const { TranslateTextCommand } = require('@aws-sdk/client-translate');
const { translateClient } = require('../../config/aws');

// Idiomas visibles en frontend para traducir publicaciones y comentarios.
const IDIOMAS_SOPORTADOS = ['es', 'en', 'fr', 'pt'];

function validarIdioma(idioma) {
  return IDIOMAS_SOPORTADOS.includes(idioma);
}

async function traducirTexto({ texto, idiomaDestino }) {
  if (!validarIdioma(idiomaDestino)) {
    const error = new Error('Idioma no soportado');
    error.statusCode = 400;
    throw error;
  }

  // Usamos auto para detectar idioma de origen sin pedirlo al usuario.
  const comando = new TranslateTextCommand({
    Text: texto,
    SourceLanguageCode: 'auto',
    TargetLanguageCode: idiomaDestino,
  });

  const respuesta = await translateClient.send(comando);

  return {
    textoOriginal: texto,
    textoTraducido: respuesta.TranslatedText,
    idiomaDestino,
    idiomasDisponibles: IDIOMAS_SOPORTADOS,
  };
}

module.exports = {
  IDIOMAS_SOPORTADOS,
  traducirTexto,
};
