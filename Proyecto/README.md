
# Semi-Social: Aplicación Web en la Nube

## Integrantes

- Estiben Yair Lopez Leveron 202204578
- Giovanni Saul Concohá Cax 202100229
- Johan Moises Cardona Rosales 202201405

## Introducción

**Semi-Social** es una aplicación web tipo red social desarrollada como proyecto final del **Seminario de Sistemas 1**. Esta plataforma permite a usuarios registrados compartir publicaciones, interactuar a través de comentarios, comunicarse en tiempo real mediante chat y acceder a contenido traducido en múltiples idiomas.

La aplicación está completamente **desplegada en Amazon Web Services (AWS)**, utilizando una arquitectura escalable y segura que integra servicios cloud avanzados como Cognito, Rekognition, Lambda, API Gateway, RDS, EC2 con balanceador de carga, S3 y Lex.

### Características Principales

- **Autenticación Segura**: Registro e inicio de sesión con AWS Cognito y reconocimiento facial mediante Rekognition
- **Publicaciones Multimedia**: Compartir imágenes y descripciones con almacenamiento en S3
- **Sistema de Comentarios**: Interacción entre usuarios en publicaciones
- **Filtrado Inteligente**: Filtrado de publicaciones por etiquetas generadas automáticamente con Rekognition
- **Chat en Tiempo Real**: Comunicación instantánea entre amigos mediante WebSockets
- **Traducción Multiidioma**: Traducción de publicaciones y comentarios con AWS Translate
- **Chatbot Inteligente**: Asistente virtual con Lex para consultas sobre la facultad

### Stack Tecnológico

**Backend**: Node.js y Python  
**Frontend**: React o Angular  
**Base de Datos**: Amazon RDS (MySQL/PostgreSQL)  
**Infraestructura**: EC2 con balanceador de carga (ELB)  
**Servicios Cloud**: IAM, S3, Cognito, Lambda, API Gateway, Rekognition, Translate, Lex

---
