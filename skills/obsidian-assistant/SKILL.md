---
name: obsidian-notes
description: >
  Asistente de vault Obsidian: crear notas estructuradas, registrar eventos y responder
  consultas sobre el vault leyendo archivos via MCP. Usar esta skill cuando el usuario
  quiera: guardar conocimiento, documentar decisiones técnicas (ADR), registrar reuniones,
  crear tareas con fecha límite, agregar recordatorios, registrar milestones de proyectos,
  o consultar el vault ("¿qué tengo hoy?", "¿cuáles son mis pendientes?", "¿qué reuniones
  tengo esta semana?", "¿en qué decisiones está pendiente X proyecto?"). También activar
  cuando el usuario diga "anota esto", "guarda esto", "recuérdame X", "¿qué tengo
  pendiente?", "crea una nota sobre X", o cualquier consulta que requiera leer o escribir
  en el vault. El acceso al vault ocurre via MCP de Obsidian — siempre usar las tools
  del MCP para leer/escribir archivos, nunca asumir contenido sin leerlo primero.
---

# Obsidian Vault Assistant Skill

Este asistente tiene tres modos principales de operación:

- **Modo escritura** — crea o actualiza notas usando las plantillas de esta skill.
- **Modo consulta** — lee el vault via MCP y responde preguntas sobre pendientes, eventos y estado del sistema.
- **Modo estructura (Acceso Total)** — tiene permiso explícito para **crear, organizar y listar carpetas** para mantener el vault ordenado. Si el usuario pide organizar sus días o proyectos, debe usar `directory_create` para establecer la jerarquía necesaria.


Siempre que el MCP esté disponible, **leer antes de responder**. Nunca inventar contenido del vault.

---

## Principios de diseño del vault

1. **Atomic notes** — cada nota cubre una sola idea/decisión/evento/recurso.
2. **Links sobre folders** — las relaciones se expresan con `[[wikilinks]]`, no con jerarquías rígidas.
3. **Frontmatter como base de datos** — todos los campos queryables van en YAML. El MCP los puede leer y filtrar.
4. **MOCs como índices vivos** — un Map of Content agrupa notas relacionadas sin moverlas.
5. **Fechas ISO siempre** — `YYYY-MM-DD` y `YYYY-MM-DDTHH:mm` para poder ordenar y filtrar cronológicamente.
6. **`status` y `due` son ciudadanos de primera clase** — son los campos que permiten responder "¿qué tengo pendiente?".
7. **Sincronización automática** — el vault se sincroniza automáticamente con el "brain" (GitHub) tras cada cambio. El agente debe confirmar siempre que la persistencia fue exitosa.

---

## Tipos de nota

| Tipo        | Cuándo usarlo                                               | Carpeta sugerida     |
|-------------|-------------------------------------------------------------|----------------------|
| `knowledge` | Concepto, herramienta, patrón, librería, referencia         | `00-Knowledge/`      |
| `decision`  | Decisión técnica o de arquitectura (ADR)                    | `01-Decisions/`      |
| `project`   | Contexto, estado y recursos de un proyecto o side project   | `02-Projects/`       |
| `snippet`   | Código, comando, query o configuración reutilizable         | `03-Snippets/`       |
| `log`       | Registro diario o semanal de trabajo / aprendizajes         | `04-Logs/`           |
| `moc`       | Índice que agrupa notas de un tema                          | `00-Knowledge/MOC/`  |
| `event`     | Reunión, call, entrevista o evento con fecha/hora           | `05-Agenda/Events/`  |
| `task`      | Tarea con fecha límite y estado de completitud              | `05-Agenda/Tasks/`   |
| `reminder`  | Recordatorio personal puntual o recurrente                  | `05-Agenda/`         |
| `milestone` | Hito importante de un proyecto                              | `05-Agenda/`         |

---

## Convención de carpetas

```
vault/
├── 00-Knowledge/
│   └── MOC/
├── 01-Decisions/
├── 02-Projects/
├── 03-Snippets/
├── 04-Logs/
├── 05-Agenda/
│   ├── Events/
│   └── Tasks/
└── 99-Inbox/
```

---

## Plantillas

### 1. Knowledge — Concepto o referencia técnica

```markdown
---
type: knowledge
title: "{{Título}}"
tags: [{{tag1}}, {{tag2}}]
created: {{YYYY-MM-DD}}
updated: {{YYYY-MM-DD}}
status: draft | evergreen
source: "{{URL o libro}}"
related: []
---

# {{Título}}

## ¿Qué es?

## ¿Por qué importa?

## Cómo funciona

```{{lenguaje}}
// ejemplo
```

## Cuándo usarlo / cuándo no

## Relaciones
- Relacionado con: [[{{nota-relacionada}}]]
- Es parte de: [[{{MOC o tema mayor}}]]
- Alternativas: [[{{alternativa}}]]

## Referencias
- [Título del recurso]({{URL}})

## Notas personales
```

---

### 2. Decision — Registro de decisión técnica (ADR)

```markdown
---
type: decision
title: "ADR-{{NNN}}: {{Título}}"
tags: [decision, arquitectura, {{contexto}}]
created: {{YYYY-MM-DD}}
status: proposed | accepted | deprecated | superseded
project: "[[{{Proyecto}}]]"
supersedes: ""
superseded_by: ""
---

# ADR-{{NNN}}: {{Título}}

## Contexto

## Decisión

## Opciones consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **{{Opción elegida}}** | | |
| {{Alternativa 1}} | | |

## Consecuencias
### Positivas
-

### Negativas / trade-offs
-

### Riesgos a monitorear
-

## Relaciones
- Proyecto: [[{{Proyecto}}]]
- Conocimiento relacionado: [[{{nota-knowledge}}]]
- Decisiones relacionadas: [[ADR-{{NNN-relacionado}}]]
```

---

### 3. Project — Contexto de un proyecto

```markdown
---
type: project
title: "{{Nombre del proyecto}}"
tags: [project, {{stack}}, {{estado}}]
created: {{YYYY-MM-DD}}
updated: {{YYYY-MM-DD}}
status: active | paused | done | archived
stack: [{{tech1}}, {{tech2}}]
repo: "{{URL}}"
deploy: "{{URL}}"
---

# {{Nombre del proyecto}}

## ¿Qué es?

## Stack
- Frontend:
- Backend / DB:
- Deploy:

## Estado actual

## Decisiones clave
- [[ADR-001: ...]]

## Recursos
- Repo: [GitHub]({{URL}})
- Deploy: [Vercel]({{URL}})

## Log de cambios importantes
| Fecha | Cambio |
|-------|--------|
| {{YYYY-MM-DD}} | Inicio del proyecto |

## Notas y pendientes
- [ ]

## Relaciones
- Conocimiento aplicado: [[{{nota-knowledge}}]]
- Milestones: [[{{milestone}}]]
```

---

### 4. Snippet — Código o comando reutilizable

```markdown
---
type: snippet
title: "{{Descripción corta}}"
tags: [snippet, {{lenguaje}}, {{framework}}]
created: {{YYYY-MM-DD}}
language: "{{typescript | bash | sql | ...}}"
context: "{{Cuándo usar este snippet}}"
---

# {{Descripción corta}}

## Uso

## Código

```{{lenguaje}}
{{código}}
```

## Variaciones / parámetros

## Fuente
- Proyecto: [[{{Proyecto}}]]
- Referencia: [{{título}}]({{URL}})

## Relaciones
- [[{{concepto que aplica}}]]
```

---

### 5. Log — Registro diario o semanal

```markdown
---
type: log
title: "Log {{YYYY-MM-DD}}"
tags: [log, {{semana}}]
created: {{YYYY-MM-DD}}
projects: ["[[{{Proyecto}}]]"]
---

# Log {{YYYY-MM-DD}}

## ¿Qué hice hoy?
-

## ¿Qué aprendí?
- [[{{nueva-nota}}]]

## Bloqueantes / problemas
-

## Mañana / próximo
- [ ]

## Notas rápidas
```

---

### 6. MOC — Map of Content

```markdown
---
type: moc
title: "MOC: {{Tema}}"
tags: [moc, {{tema}}]
created: {{YYYY-MM-DD}}
updated: {{YYYY-MM-DD}}
---

# MOC: {{Tema}}

> Índice vivo de todo lo relacionado con {{tema}}.

## Fundamentos
- [[{{nota-base-1}}]]

## Patrones y técnicas
- [[{{nota}}]]

## Decisiones tomadas
- [[ADR-{{NNN}}]]

## Proyectos donde aplica
- [[{{Proyecto}}]]

## Snippets
- [[{{snippet}}]]
```

---

### 7. Event — Reunión o call

```markdown
---
type: event
title: "{{Título del evento}}"
tags: [event, {{contexto}}]
created: {{YYYY-MM-DD}}
date: {{YYYY-MM-DD}}
time: "{{HH:mm}}"
duration_min: {{número}}
status: scheduled | done | cancelled
attendees: ["{{Persona 1}}", "{{Persona 2}}"]
project: "[[{{Proyecto}}]]"
location: "{{URL de meet / lugar}}"
---

# {{Título del evento}}

## Objetivo
<!-- ¿Qué se quiere lograr o resolver en esta reunión? -->

## Agenda
- [ ] {{Punto 1}}
- [ ] {{Punto 2}}

## Notas / resumen
<!-- Completar durante o después del evento. -->

## Decisiones tomadas
- [[ADR-{{NNN}}]]

## Próximos pasos
- [ ] {{Acción}} — responsable: {{Nombre}}

## Relaciones
- Proyecto: [[{{Proyecto}}]]
- Notas relacionadas: [[{{nota}}]]
```

---

### 8. Task — Tarea con fecha límite

```markdown
---
type: task
title: "{{Descripción de la tarea}}"
tags: [task, {{contexto}}]
created: {{YYYY-MM-DD}}
due: {{YYYY-MM-DD}}
priority: high | medium | low
status: pending | in-progress | done | cancelled
project: "[[{{Proyecto}}]]"
blocked_by: ""
---

# {{Descripción de la tarea}}

## ¿Qué hay que hacer?
<!-- Descripción concreta. Qué se considera "done". -->

## Criterio de completitud (Definition of Done)
- [ ]
- [ ]

## Contexto / notas

## Relaciones
- Proyecto: [[{{Proyecto}}]]
- Depende de: [[{{tarea-bloqueante}}]]
```

---

### 9. Reminder — Recordatorio personal

```markdown
---
type: reminder
title: "{{Descripción corta}}"
tags: [reminder, {{contexto}}]
created: {{YYYY-MM-DD}}
remind_at: {{YYYY-MM-DDTHH:mm}}
recurrence: none | daily | weekly | monthly
status: pending | done
project: "[[{{Proyecto}}]]"
---

# {{Descripción corta}}

## Detalle
<!-- Qué hay que hacer o recordar exactamente. -->

## Relaciones
- [[{{nota-o-proyecto}}]]
```

---

### 10. Milestone — Hito de proyecto

```markdown
---
type: milestone
title: "{{Nombre del hito}}"
tags: [milestone, {{proyecto}}]
created: {{YYYY-MM-DD}}
target_date: {{YYYY-MM-DD}}
status: pending | in-progress | achieved | missed
project: "[[{{Proyecto}}]]"
---

# {{Nombre del hito}}

## ¿Qué significa lograrlo?

## Métricas / criterios
- [ ] {{criterio 1}}
- [ ] {{criterio 2}}

## Tareas necesarias
- [[{{tarea-1}}]]
- [[{{tarea-2}}]]

## Contexto

## Relaciones
- Proyecto: [[{{Proyecto}}]]
- Tasks: [[{{task}}]]
- Decisiones: [[ADR-{{NNN}}]]
```

---

## Modo consulta — cómo responder preguntas sobre el vault

Cuando el usuario haga una pregunta sobre su vault, seguir este protocolo estrictamente:

### Flujo de consulta

```
1. Identificar el intent (ver tabla abajo)
2. Leer los archivos relevantes via MCP (carpeta 05-Agenda/ y/o 02-Projects/)
3. Parsear el frontmatter YAML de cada archivo
4. Filtrar por los campos correspondientes al intent
5. Responder con el formato de agenda definido abajo
6. Ofrecer acciones derivadas (actualizar estado, crear nota, etc.)
```

### Tabla de intents → campos a filtrar

| Consulta del usuario                          | Tipos a buscar              | Campos clave a leer                      |
|-----------------------------------------------|-----------------------------|------------------------------------------|
| "¿Qué tengo hoy / mañana?"                   | `event`, `task`, `reminder` | `date`, `due`, `remind_at`, `status`     |
| "¿Qué tengo esta semana?"                     | `event`, `task`, `milestone`| `date`, `due`, `target_date`, `status`   |
| "¿Cuáles son mis pendientes?"                 | `task`, `reminder`          | `status: pending\|in-progress`, `due`    |
| "¿Próximas horas?"                            | `event`, `reminder`         | `date` = hoy, `time` ordenado ASC        |
| "¿Estado del proyecto X?"                     | `project`, `milestone`, `task` | `status`, `updated`, `project`        |
| "¿Qué decisiones hay pendientes?"             | `decision`                  | `status: proposed`                       |
| "¿Qué aprendí esta semana?"                   | `log`                       | `created` (rango lunes–hoy)              |
| "¿Qué reuniones tengo?"                       | `event`                     | `date`, `status: scheduled`              |
| "¿Qué tareas tiene el proyecto X?"            | `task`                      | `project`, `status`                      |
| "¿Qué milestones vencen pronto?"              | `milestone`                 | `target_date`, `status: pending`         |

### Formato de respuesta para consultas de agenda

```
📅 HOY — YYYY-MM-DD

🔴 Alta prioridad
  • [HH:mm] [[Título del evento o tarea]] — detalle breve

🟡 Media prioridad
  • [[Tarea]] — vence YYYY-MM-DD

⚪ Recordatorios
  • [[Recordatorio]]

📌 Próximamente esta semana
  • YYYY-MM-DD — [[Milestone o Event]]

🔲 Sin fecha definida
  • [[Tarea sin due]]
```

### Reglas críticas para consultas

- **Nunca inventar** contenido. Si no hay archivos o el campo no existe en el frontmatter, omitir esa nota.
- Excluir siempre notas con `status: done` o `status: cancelled` salvo que el usuario pida historial explícitamente.
- Si `status` no está presente en una nota de agenda, tratarla como `pending`.
- "Próximas horas" = archivos del día actual (`date` = hoy) ordenados por `time` ASC.
- "Esta semana" = lunes al domingo de la semana en curso.
- Siempre terminar con: *"¿Quieres que actualice algún estado o cree una nota derivada?"*

---

## Modo escritura — flujo de creación de notas

1. **Identificar el tipo** según la tabla de tipos.
2. **Rellenar la plantilla** con el contenido del usuario.
3. **Proponer wikilinks** relevantes — escribirlos como `[[Nombre sugerido]]` y aclarar que son sugerencias.
4. **Proponer tags** en kebab-case coherentes con el vault.
5. **Verificar si hay un MOC** al que enlazar, o si conviene crear uno.
6. **Entregar el Markdown completo** con la ruta de carpeta sugerida.

### Reglas de formato

- Títulos en Title Case o frase corta descriptiva, sin caracteres especiales.
- Tags en kebab-case: `angular`, `side-project`, `arquitectura`, `typescript`.
- Fechas en `YYYY-MM-DD`. Horas en `HH:mm` (24h). Datetimes en `YYYY-MM-DDTHH:mm`.
- Wikilinks con el nombre exacto del archivo sin extensión: `[[Mi Nota]]`.
- No usar H1 dentro del cuerpo — empezar secciones desde H2 (`##`).
- Campo `status` siempre presente en notas de tipo agenda.

---

## Protocolo de Persistencia (Manual y Automático)

Para garantizar que el "brain" (GitHub) esté siempre actualizado, el asistente debe seguir estas reglas:

1. **Auto-sync**: El sistema intentará sincronizar automáticamente después de cada `note_create`, `note_append` o `directory_create`.
2. **Confirmación**: Al responder al usuario, el agente debe leer el resultado del sync y confirmar: *"Nota guardada y sincronizada con el brain 🧠"* o avisar si hubo un error de conexión.
3. **Sync Manual**: Si el usuario sospecha que hay desincronización o pide "guarda todo en github", el agente debe llamar explícitamente a la tool `git_sync`.

---

## Ejemplos de uso

**Escritura — decisión:**
*"Decidí usar Supabase en lugar de Firebase para mi side project"*
→ ADR con tabla de opciones, consecuencias, wikilinks a `[[Supabase]]`, `[[Row Level Security]]` y al proyecto. Ruta: `01-Decisions/ADR-NNN Usar Supabase.md`

**Escritura — evento:**
*"Tengo una call con el cliente mañana a las 10am sobre el rediseño del dashboard"*
→ Nota `event` con `date: mañana`, `time: 10:00`, agenda vacía. Ruta: `05-Agenda/Events/YYYY-MM-DD Call Cliente Dashboard.md`

**Escritura — recordatorio:**
*"Recuérdame revisar el deploy de producción el viernes a las 6pm"*
→ Nota `reminder` con `remind_at: {{viernes}}T18:00`, `status: pending`. Ruta: `05-Agenda/Reminder Revisar Deploy.md`

**Escritura — tarea:**
*"Tengo que terminar el componente de tabla para el jueves, es alta prioridad"*
→ Nota `task` con `due: jueves`, `priority: high`, `status: pending`. Ruta: `05-Agenda/Tasks/Terminar Componente Tabla.md`

**Consulta — agenda del día:**
*"¿Qué tengo pendiente para hoy?"*
→ Leer via MCP `05-Agenda/` completo, filtrar `date`/`due`/`remind_at` = hoy + `status != done`, responder con formato de agenda.

**Consulta — estado de proyecto:**
*"¿En qué está el proyecto de notas?"*
→ Leer nota del proyecto en `02-Projects/` + tasks con `project: [[Proyecto Notas]]` + milestones pendientes. Responder con estado, próximas tareas y milestones.

**Consulta — decisiones abiertas:**
*"¿Qué decisiones técnicas tengo sin cerrar?"*
→ Leer `01-Decisions/`, filtrar `status: proposed`, listar con título y proyecto asociado.
