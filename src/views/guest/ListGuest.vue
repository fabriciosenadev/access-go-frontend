<script setup lang="ts">
import { eventService } from '@/services';
import { onMounted, ref } from 'vue';

const headers = [
    { title: 'Name', key: 'Guest.FullName' },
    { title: 'Email', key: 'Guest.Email' },
    { title: 'Check-In', key: 'CheckIn' },
    { title: 'Check-Out', key: 'CheckOut' }
]

const guests = ref([])
const loading = ref()

async function getGuests () {
    loading.value = true
    try {
        let { data } = await eventService.getAll()
        guests.value = data;
    } catch {
        guests.value.push(
            {
                "Id": "3ca1fd5a-089b-4186-a922-82f01d000818",
                "GuestId": "581c0b3e-48e5-4f45-b1ec-8c6313dfbe3a",
                "Guest": {
                    "Id": "581c0b3e-48e5-4f45-b1ec-8c6313dfbe3a",
                    "FullName": "asdasd",
                    "Email": "s4mus.sh@gmail.com",
                    "PhoneNumber": "11981568415"
                },
                "SourceBarcode": "11981568415",
                "CheckIn": "2024-09-25T16:01:55.927Z",
                "CheckOut": "2024-09-25T16:02:45.089Z"
            })
    }

    loading.value = false
}

onMounted(async () => {
    await getGuests()
})

</script>
<template>
    <v-data-table-server :items="guests" :headers="headers" loading-text="Carregando... Aguarde."
    :loading="loading">
        <template v-slot:[`item.CheckIn`]="{ item }">
            <span>{{ new Date(item.CheckIn).toLocaleString() }}</span>
        </template>
        <template v-slot:[`item.CheckOut`]="{ item }">
            <span>{{ new Date(item.CheckOut).toLocaleString() }}</span>
        </template>
    </v-data-table-server>
</template>