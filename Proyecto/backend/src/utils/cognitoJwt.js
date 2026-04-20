// Verifica tokens JWT emitidos por Amazon Cognito
// Cognito firma sus tokens con claves públicas disponibles en una URL JWKS

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID; 
const REGION = process.env.AWS_REGION || 'us-east-2';

// Cliente que descarga y cachea las claves públicas de Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutos
});

/**
 * Obtiene la clave pública correspondiente al kid del token
 */
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verifica un access token o id token de Cognito.
 * Retorna el payload decodificado o lanza error.
 */
function verificarToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

module.exports = { verificarToken };