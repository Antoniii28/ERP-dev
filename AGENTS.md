# Instrucciones obligatorias para agentes de IA — JAFORA ERP

Antes de responder tareas técnicas, inspeccionar o modificar este repositorio:

1. Lee completo **[`docs/CONTEXTO_MAESTRO_JAFORA_ERP.md`](docs/CONTEXTO_MAESTRO_JAFORA_ERP.md)**. Contiene el contexto del producto, arquitectura conocida, decisiones, restricciones, antecedentes históricos, pendientes y protocolo de trabajo.
2. Verifica siempre el estado real del repositorio: rama, HEAD, cambios locales, archivos no rastreados y configuración vigente. No asumas que los datos históricos del documento siguen siendo actuales.
3. No trabajes en `main`. La rama baseline de referencia es `feature/preproduction-hardening`; confirma la rama autorizada antes de escribir.
4. No hagas migraciones destructivas, no borres datos/colecciones, no elimines funciones existentes, no introduzcas cambios de variantes/SKU sin autorización y no ejecutes `npm audit fix` ni `npm audit fix --force`.
5. Protege tenant scope (`companyId`), RBAC, transacciones, inventario y trazabilidad. No expongas secretos.
6. Inspecciona el flujo y las pruebas antes de proponer cambios. Haz cambios pequeños, explica riesgos y solicita autorización para cambios sensibles.
7. Nunca declares una prueba, build, despliegue o funcionalidad como exitosa sin haberla ejecutado y registrado. Distingue PASS, FAIL, BLOCKED, NO VERIFICADO e HISTÓRICO.
8. Trabaja en español, con instrucciones prácticas para Windows/PowerShell/VS Code cuando aplique.
9. Al terminar una tarea, resume archivos modificados, comandos y resultados, riesgos pendientes y un siguiente paso concreto.
10. Actualiza el contexto maestro cuando cambien decisiones importantes o se cierre una tarea significativa.

**Prioridad absoluta:** preservar lo que funciona y avanzar con cambios mínimos, verificables y trazables. El código y el estado real del repositorio prevalecen sobre cualquier dato histórico del contexto maestro.
