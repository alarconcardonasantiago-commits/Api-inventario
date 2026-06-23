# Melodía Instrumental - API de Inventario

Esta es la API del sistema de gestión de inventario para la tienda de instrumentos "Melodía Instrumental". Desarrollado como parte del proyecto de grado para el programa de formación tecnológica **Análisis y Desarrollo de Software (ADSO) - SENA**.

## 🚀 Tecnologías Utilizadas

- **Node.js y Express.js**: Entorno de ejecución y framework minimalista para construir la API REST.
- **MySQL (Aiven)**: Sistema de gestión de bases de datos relacional para garantizar la integridad y seguridad de la información.
- **Docker**: Contenerización de la aplicación para asegurar un despliegue homogéneo y facilitar la instalación con un solo comando.
- **Cloudflare Tunnels**: Para exponer la API de manera segura a internet (HTTPS) sin requerir apertura de puertos físicos o depender de plataformas limitadas (ej. Render/Railway gratuitos).

## 🎯 Objetivo Educativo

El objetivo de este backend es demostrar la capacidad de crear arquitecturas cliente-servidor escalables, aplicando buenas prácticas como:
- Enrutamiento estructurado.
- Transacciones atómicas (ACID) en compras y control de inventario.
- Variables de entorno para protección de credenciales.
- Despliegue moderno usando contenedores.

## ⚙️ Instalación (Con Docker)

1. Clona el repositorio.
2. Crea el archivo `.env` tomando como base `.env.example`.
3. Desde la carpeta superior que contiene el archivo `docker-compose.yml`, ejecuta:
   ```bash
   docker-compose up -d
   ```
4. La API quedará escuchando localmente en el puerto `3000` y expuesta según la configuración de Cloudflare Tunnel.

## 🔗 Rutas Principales

- `/api/productos` - Gestión del catálogo.
- `/api/ventas` - Registro de transacciones y Checkout del carrito de compras.
- `/api/auth` - Autenticación de administradores.
