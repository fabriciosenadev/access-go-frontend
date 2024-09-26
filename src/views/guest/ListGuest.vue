<script setup lang="ts">
import { eventService } from '@/services';
import { onMounted, ref } from 'vue';

const headers = [
    { title: 'Nome', key: 'Guest.FullName' },
    { title: 'Email', key: 'Guest.Email' },
    { title: 'Telefone', key: 'Guest.PhoneNumber' },
    { title: 'Check-In', key: 'CheckIn' },
    { title: 'Check-Out', key: 'CheckOut' }
]

const guests = ref([])
const loading = ref()

async function getGuests () {
    loading.value = true

    let { data } = await eventService.getAll()
    guests.value = data;

    loading.value = false
}

onMounted(async () => {
    await getGuests()
})

</script>
<template>
    <v-data-table-server :items="guests" :headers="headers" loading-text="Carregando... Aguarde." :loading="loading">
        <template v-slot:[`item.CheckIn`]="{ item }">
            <span>{{ new Date(item.CheckIn).toLocaleString() }}</span>
        </template>
        <template v-slot:[`item.CheckOut`]="{ item }">
            <span>{{ new Date(item.CheckOut).toLocaleString() }}</span>
        </template>
    </v-data-table-server>
</template>