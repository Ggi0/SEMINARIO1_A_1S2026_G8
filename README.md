# SEMINARIO1_A_1S2026_G8



# CloudCinema -- Práctica 1

Seminario de Sistemas 1 -- 1S2026 Universidad de San Carlos de Guatemala

------------------------------------------------------------------------

## 1. Datos de los Estudiantes

  Nombre Completo                   Carné         Rol en el Proyecto
  -----------------                 ----------  -----------------------
  Johan Moises Cardona Rosales      202201405   Backend Node.js, AWS Config
  Giovanni Saul Concoha Cax         202100229   Backend Python,   AWS Config
  Estiben Yair Lopez Leveron        202204578   Frontend, Base de Datos & IAM

Grupo: G8\
Repositorio: SEMINARIO1_A\_1S2026_G#

------------------------------------------------------------------------

# 2. Descripción de la Arquitectura Utilizada

Se implementó una arquitectura distribuida en AWS con alta
disponibilidad utilizando:

-   IAM
-   EC2 (2 instancias)
-   Application Load Balancer
-   S3
-   Amazon RDS
-   Security Groups

------------------------------------------------------------------------

## Arquitectura General

Usuario → S3 (Frontend estático)\
Frontend → Load Balancer (DNS público)\
Load Balancer → EC2 Node.js\
Load Balancer → EC2 Python\
Ambas EC2 → Amazon RDS\
Ambas EC2 → S3 (Imágenes)

------------------------------------------------------------------------

## Componentes Implementados

### Amazon S3

Se crearon dos buckets:

-   Practica1-Web-G#
    -   Hosting web estático
    -   Contiene archivos HTML, CSS y JS del frontend
-   Practica1-Images-G#
    -   Carpeta Fotos_Perfil/
    -   Carpeta Fotos_Peliculas/
    -   Permisos públicos con política s3:GetObject

Las imágenes no se almacenan en la base de datos, únicamente se guarda
la ruta: Fotos_Perfil/foto1.jpg

------------------------------------------------------------------------

### Instancias EC2

Se configuraron dos instancias:

  Instancia    Tecnología          Puerto
  ------------ ------------------- --------
  EC2-Node     Node.js + Express   3000
  EC2-Python   Python + Flask      5000

Ambas instancias:

-   Utilizan AWS SDK
-   Se conectan a la misma base de datos RDS
-   Exponen los mismos endpoints:
    -   /register
    -   /login
    -   /peliculas
    -   /lista
    -   /perfil

------------------------------------------------------------------------

### Application Load Balancer

-   Tipo: Application Load Balancer
-   Target Group con ambas instancias
-   Distribución equitativa del tráfico
-   Prueba de alta disponibilidad:
    -   Al apagar una instancia, el sistema sigue funcionando
        correctamente

------------------------------------------------------------------------

### Amazon RDS

Motor utilizado: PostgreSQL

Base de datos relacional externa.

Tablas principales:

-   usuarios
-   peliculas
-   lista_reproduccion

Características:

-   Contraseñas almacenadas con MD5
-   No se almacenan imágenes binarias
-   Solo URLs públicas de S3

------------------------------------------------------------------------

### Security Groups

Configuración aplicada:

EC2: - Puerto 80 (HTTP) - Puerto 3000 - SSH (solo IP autorizada)

RDS: - Puerto 3306 (MySQL) - Solo acceso desde Security Group de EC2

------------------------------------------------------------------------

# 3. Usuarios IAM y Políticas Utilizadas

Se aplicó separación de responsabilidades.

## IAM-S3-User

Servicio: S3\
Políticas: - AmazonS3FullAccess (limitado al bucket específico mediante
policy personalizada)

Permisos: - s3:PutObject - s3:GetObject - s3:DeleteObject

Uso: - Subida de fotos de perfil - Subida de pósters de películas

------------------------------------------------------------------------

## IAM-EC2-User

Servicio: EC2\
Políticas: - AmazonEC2FullAccess

Uso: - Creación y gestión de instancias - Configuración de Security
Groups

------------------------------------------------------------------------

## IAM-RDS-User

Servicio: RDS\
Políticas: - AmazonRDSFullAccess

Uso: - Creación y configuración de base de datos - Gestión de motor
relacional

------------------------------------------------------------------------

## IAM-LoadBalancer-User

Servicio: ELB\
Políticas: - ElasticLoadBalancingFullAccess

Uso: - Creación del Application Load Balancer - Configuración de Target
Groups

------------------------------------------------------------------------

# 4. Capturas de Pantalla

Insertar aquí las capturas de:

-   Buckets S3
-   Instancias EC2
-   Amazon RDS
-   Application Load Balancer
-   Aplicación Web funcionando

------------------------------------------------------------------------

# 5. Pruebas Realizadas

-   Registro con correo único
-   Encriptación MD5
-   Subida de imágenes a S3
-   Alta disponibilidad apagando una EC2
-   Balanceo de tráfico
-   Conexión correcta a RDS
-   Gestión de lista de reproducción

------------------------------------------------------------------------

# 6. Conclusiones

Se logró implementar una arquitectura distribuida en AWS con:

-   Alta disponibilidad
-   Separación de responsabilidades con IAM
-   Balanceo de carga funcional
-   Almacenamiento externo de imágenes
-   Base de datos relacional en la nube
-   Aplicación completamente desplegada en AWS
