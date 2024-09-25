<script setup lang="js">
import { ref } from 'vue';
import { router } from '@/router';

const drawer = ref()

console.log(router.currentRoute.value.name);

const items = ref([
  {
    name: "Scan",
    to: "/"
  },
  {
    name: "Convidados",
    to: "/list"
  },
  {
    name: "Novo convidado",
    to: "/new"
  }
])

</script>
<template>
        <v-app-bar color="primary" prominent>
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

          <v-toolbar-title>AccessGo
            <span class="body-text-2 text-secondary">- {{ router.currentRoute.value.name }}</span>
          </v-toolbar-title>
        </v-app-bar>

        <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
          <v-list>
            <v-list-item v-for="item in items" :key="item" @click="$router.push(item.to)">
              {{ item.name }}
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
</template>