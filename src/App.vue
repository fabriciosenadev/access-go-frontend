<script setup lang="js">
import NavigationDrawer from '@/components/navigationDrawer/NavigationDrawer.vue';

</script>
<template>
  <v-app id="app">
    <NavigationDrawer />

    <v-main style="height: 500px;">
    <RouterView />
    </v-main>
  </v-app>
</template>
