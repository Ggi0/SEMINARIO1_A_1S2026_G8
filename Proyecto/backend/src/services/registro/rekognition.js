// Reconocimiento facial para el login por foto

const { CompareFacesCommand } = require('@aws-sdk/client-rekognition');
const { rekognitionClient } = require('../../config/aws');

const S3_BUCKET = process.env.S3_BUCKET_NAME; // semi1proyecto-g8

/**
 * Compara una imagen enviada por el usuario contra la foto de perfil
 * almacenada en S3, usando Amazon Rekognition.
 * 
 * @param {Buffer} imagenBuffer - La imagen enviada por el usuario (desde el frontend)
 * @param {string} s3Key - La clave S3 de la foto de perfil del usuario candidato
 * @returns {{ coincide: boolean, similitud: number }}
 */
async function compararRostros(imagenBuffer, s3Key) {
  const comando = new CompareFacesCommand({
    SourceImage: {
      // La imagen que el usuario envía para autenticarse
      Bytes: imagenBuffer,
    },
    TargetImage: {
      // La foto de perfil guardada en S3
      S3Object: {
        Bucket: S3_BUCKET,
        Name: s3Key,
      },
    },
    SimilarityThreshold: 80, // Mínimo 80% de similitud para aceptar
  });

  console.log("BUCKET:", S3_BUCKET);
console.log("KEY:", s3Key);
console.log("REGION REKOGNITION:", process.env.AWS_REGION);


  try {
    const respuesta = await rekognitionClient.send(comando);

    if (respuesta.FaceMatches && respuesta.FaceMatches.length > 0) {
      const mejorCoincidencia = respuesta.FaceMatches[0];
      return {
        coincide: true,
        similitud: mejorCoincidencia.Similarity,
      };
    }

    return { coincide: false, similitud: 0 };
  } catch (error) {
    // InvalidParameterException: no se detectó rostro en alguna imagen
    if (error.name === 'InvalidParameterException') {
      return { coincide: false, similitud: 0 };
    }
    throw error;
  }
}

module.exports = { compararRostros };