import { d as defineNuxtRouteMiddleware, n as navigateTo } from './server.mjs';
import { u as useAuth } from './useAuth-B2S6qmav.mjs';
import 'vue';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const auth = defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-Bk2-TZaO.mjs.map
