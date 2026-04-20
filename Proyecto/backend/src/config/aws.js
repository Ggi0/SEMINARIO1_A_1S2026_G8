
// Configuración centralizada de clientes AWS

const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');

const REGION = process.env.AWS_REGION || 'us-east-2';

const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const rekognitionClient = new RekognitionClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { cognitoClient, rekognitionClient };