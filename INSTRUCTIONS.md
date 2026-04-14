# 🚀 Guía de Configuración y Despliegue

Sigue estos pasos detallados para poner en marcha tu Asistente Personal de Obsidian.

## 1. Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
- **Node.js** (v18 o superior)
- **Git** (configurado con SSH para GitHub)
- **Telegram** (una cuenta activa)

## 2. Configuración de Variables de Entorno

El proyecto utiliza un archivo `.env` para manejar secretos y rutas.

1.  Copia el archivo de ejemplo (si no existe, créalo):
    ```bash
    cp .env.example .env
    ```
2.  Edita el archivo `.env` con tus datos:
    - `VAULT_PATH`: La ruta absoluta donde está (o estará) tu vault de Obsidian.
    - `TELEGRAM_BOT_TOKEN`: El token que obtuviste de [@BotFather](https://t.me/botfather).
    - `GH_REMOTE`: La URL SSH de tu repo de GitHub para backups.
    - `OPENCODE_PORT`: Puerto para el servidor del agente (por defecto 4096).

## 3. Configuración del Agente (`opencode.json`)

El archivo `opencode.json` conecta al agente con el servidor MCP de Obsidian. Asegúrate de que las rutas sean correctas:

1.  Abre `opencode.json`.
2.  Verifica la sección `mcp.obsidian.command`:
    - La ruta al archivo `index.js` debe ser la ruta absoluta a `/home/dev-frontend/sideprojects/agent-assistent/mcp-server/build/index.js`.
3.  Verifica `mcp.obsidian.environment.VAULT_PATH`:
    - Debe coincidir con la ruta de tu vault definida en el `.env`.

 Ejemplo de configuración:
 ```json
 "obsidian": {
   "type": "local",
   "command": ["node", "/tu/ruta/al/proyecto/mcp-server/build/index.js"],
   "environment": {
     "VAULT_PATH": "/tu/ruta/al/vault"
   },
   "enabled": true
 }
 ```

### Cargar Skills desde cualquier ubicación

Si tienes carpetas de skills fuera del proyecto y quieres que el asistente las use, simplemente añade la **ruta absoluta** al array de `paths` en la sección `skills`:

```json
"skills": {
  "paths": [
    "./skills",
    "/home/usuario/mis-otras-skills"
  ]
}
```
Esto permite que el asistente herede comportamientos o herramientas globales que tengas definidas en otros directorios.

## 4. Preparación Automatizada

Ejecuta el script de configuración. Este script hará lo siguiente:
- Creará la estructura de carpetas en tu Vault (Daily, Inbox).
- Inicializará Git en tu Vault.
- Instalará todas las dependencias del Servidor MCP y del Bot de Telegram.
- Compilará el código TypeScript.

```bash
chmod +x setup.sh
./setup.sh
```

## 5. Inicio del Asistente

Una vez configurado todo, puedes iniciar el asistente con el script unificado:

```bash
chmod +x start.sh
./start.sh
```

Este comando iniciará:
1.  **OpenCode Agent Server**: El "cerebro" que procesa tus peticiones.
2.  **Telegram Bot**: La interfaz por la que hablarás con el asistente.

## 6. Verificación

1.  Abre tu bot en Telegram.
2.  Envía un mensaje como: `Hola, ¿estás listo?`
3.  El bot debería responder. Si es la primera vez, anota tu `TELEGRAM_ALLOWED_USER_ID` que aparecerá en los logs o te lo dirá el bot, y asegúrate de que esté en tu `.env` para mayor seguridad.

## 7. Resolución de Problemas

Si algo no funciona, revisa los archivos de log que se generan automáticamente:
- `opencode-server.log`: Errores del agente.
- `opencode-debug.log`: Trazas de depuración del agente.
- La consola donde ejecutaste `./start.sh` mostrará los logs del bot de Telegram.

---

¡Listo! Ya puedes empezar a gestionar tu conocimiento directamente desde Telegram.
