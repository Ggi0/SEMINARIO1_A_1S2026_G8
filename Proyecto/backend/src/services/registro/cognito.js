// Toda la lógica de comunicación con Amazon Cognito

const {
    SignUpCommand,
    AdminConfirmSignUpCommand,
    InitiateAuthCommand,
    AdminGetUserCommand,
    AdminUpdateUserAttributesCommand,
    AdminDeleteUserCommand,
    ConfirmSignUpCommand,
  } = require('@aws-sdk/client-cognito-identity-provider');
  
  const { cognitoClient } = require('../../config/aws');
  
  const CLIENT_ID = process.env.COGNITO_CLIENT_ID;       
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID; 
  
  /**
   * Registra un usuario nuevo en Cognito.
   * Cognito almacena: email, nombre, DPI como atributo custom.
   * 
   * @param {Object} datos - { username, password, correo, nombreCompleto, dpi }
   * @returns {string} sub - El ID único de Cognito (cognito_sub)
   */
  async function registrarEnCognito({ username, password, correo, nombreCompleto, dpi }) {
    const comando = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: correo },
        { Name: 'name', Value: nombreCompleto },
        { Name: 'custom:dpi', Value: dpi },
      ],
    });
  
    const respuesta = await cognitoClient.send(comando);
    return respuesta.UserSub; // El cognito_sub que guardamos en MySQL
  }
  
  /**
   * Confirma automáticamente al usuario sin necesidad de que ingrese
   * el código de verificación. Útil si quieres manejar la verificación
   * de correo de otra forma, o para desarrollo.
   */
  async function confirmarUsuarioCognito(username) {
    const comando = new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
    await cognitoClient.send(comando);
  }
  
  /**
   * Autentica al usuario con username + password usando SRP.
   * Retorna los tokens JWT de Cognito.
   * 
   * @returns {{ accessToken, idToken, refreshToken }}
   */
  async function loginConCredenciales({ username, password }) {
    const comando = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
  
    const respuesta = await cognitoClient.send(comando);
    const result = respuesta.AuthenticationResult;
  
    return {
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresIn: result.ExpiresIn,
    };
  }
  
  /**
   * Obtiene los datos de un usuario de Cognito por su username.
   * Útil para verificar estado del usuario.
   */
  async function obtenerUsuarioCognito(username) {
    const comando = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
    return await cognitoClient.send(comando);
  }
  
  /**
   * Actualiza atributos del usuario en Cognito cuando el usuario
   * modifica su perfil en la aplicación.
   * 
   * @param {string} username
   * @param {Array} atributos - [{ Name: 'email', Value: '...' }, ...]
   */
  async function actualizarAtributosCognito(username, atributos) {
    const comando = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: atributos,
    });
    await cognitoClient.send(comando);
  }


  async function confirmarUsuarioCodigo({ username, codigo }) {
    const comando = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: codigo,
    });
  
    await cognitoClient.send(comando);
  }
  
  module.exports = {
    registrarEnCognito,
    confirmarUsuarioCognito,
    loginConCredenciales,
    obtenerUsuarioCognito,
    actualizarAtributosCognito,
    confirmarUsuarioCodigo,
  };