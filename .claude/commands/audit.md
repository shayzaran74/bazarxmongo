# Audit Command
---
description: Run a full technical audit on a specific module or feature.
---

Audit the requested module following these steps:
1. **Dependency Analysis:** Check for circular dependencies.
2. **Type Safety:** Find any missing types or `any` usages.
3. **Architecture:** Verify if it follows DDD layers (Domain -> Application -> Infrastructure).
4. **Safety:** Check for missing validation or error handling.
5. **Logs:** Ensure proper structured logging is implemented.

Usage: `/audit <module_name>`
