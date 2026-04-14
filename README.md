# Asistente Personal: Obsidian + MCP + Telegram + GitHub

Este proyecto implementa un asistente personal inteligente que gestiona un vault de Obsidian. Utiliza **OpenCode** (con Minimax) como cerebro, un **MCP Server** local como único controlador del sistema de archivos, y **Telegram** como interfaz de usuario remota.

## Arquitectura

1.  **Telegram Bot**: Proxy transparente. Recibe mensajes y los envía a OpenCode via HTTP API.
2.  **OpenCode**: Agente autónomo que utiliza el protocolo MCP para interactuar con Obsidian.
3.  **MCP Server**: Servidor local que expone herramientas para leer, crear y buscar notas, además de sincronizar con GitHub.
4.  **GitHub**: Almacén remoto para backup automático del vault.

## Requisitos

- Node.js v18+
- Git instalado y configurado con SSH para GitHub.
- [OpenCode CLI](https://opencode.ai/) (`npx opencode-ai` se usa internamente).

## Instalación

1.  Clona este repositorio o descarga los archivos.
2.  Crea un archivo `.env` basado en `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Configura las variables en `.env`:
    - `VAULT_PATH`: Ruta absoluta a tu vault de Obsidian.
    - `TELEGRAM_BOT_TOKEN`: Token de [@BotFather](https://t.me/botfather).
    - `GH_REMOTE`: URL SSH de tu repositorio de GitHub.
4.  Ejecuta el script de configuración:
    ```bash
    ./setup.sh
    ```

## Uso

Para iniciar todos los servicios:
```bash
./start.sh
```

### Comandos de Telegram
No necesitas comandos especiales. Habla con el bot en lenguaje natural:
- *"Crea una nota sobre mi viaje a Japón"*
- *"Añade 'Comprar leche' a mi nota de tareas"*
- *"Busca mis apuntes de cocina"*
- *"Sincroniza el vault con GitHub"*

### Seguridad
El bot detectará tu `TELEGRAM_ALLOWED_USER_ID` al primer mensaje que envíes. Cópialo en tu `.env` para asegurar que nadie más pueda acceder a tus notas.

## Estructura del Proyecto
- `/mcp-server`: Servidor Model Context Protocol.
- `/telegram-bot`: Cliente de Telegram y OpenCode.
- `opencode.json`: Configuración del agente y mcpServers.
- `setup.sh`: Script de inicialización automatizada.
- `start.sh`: Script de ejecución unificada.
