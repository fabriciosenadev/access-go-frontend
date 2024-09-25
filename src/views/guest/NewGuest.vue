<script setup lang="ts">
import { guestService } from '@/services';
import { ref } from 'vue';

const loading = ref()

const guest = ref(
    {
        FullName: null,
        Email: null,
        PhoneNumber: null
    }
)

async function onSave () {
    loading.value = true
    try {
        let guestRequest = {
            FullName: guest.value.FullName,
            Email: guest.value.Email,
            PhoneNumber: ('' + guest.value.PhoneNumber).replace(/\D/g, '')
        }

        await guestService.post(guestRequest)

        showSnackbar('Salvo com sucesso!', 'success')

        guest.value = {
            FullName: null,
            Email: null,
            PhoneNumber: null
        }
    } catch {
        showSnackbar('Ocorreu um erro inesperado', 'error')
    }

    loading.value = false
}

function showSnackbar (message, color) {
    snack.value.show = true
    snack.value.message = message
    snack.value.color = color
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rules = ref({
    name: (value: string) => value && value.length > 3 || 'Insira um nome válido',
    email: (value: string) => emailRegex.test(value) || 'Insira um email válido',
    phone: (value: string) => value && value.length == 15 || 'Insira um telefone válido'
});

const valid = ref()

function formatPhone () {
    let cleaned = ('' + guest.value.PhoneNumber).replace(/\D/g, '');
    let match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
        guest.value.PhoneNumber = (!match[2] ? match[1] : `(${match[1]}) ${match[2]}`) + (match[3] ? `-${match[3]}` : '');
    }
}

const snack = ref({
    show: false,
    message: null,
    color: null
})

</script>
<template>
    <v-container fluid class="d-flex align-center justify-center" style="height: 100%;">
        <v-row align="center" justify="center">
            <v-card-title>Cadastrar novo convidado</v-card-title>
            <v-col cols="12" sm="8" md="12">
                <v-form v-model="valid">
                    <v-text-field v-model="guest.FullName" :rules="[rules.name]" label="Nome"></v-text-field>
                    <v-text-field v-model="guest.Email" :rules="[rules.email]" label="E-mail"></v-text-field>
                    <v-text-field v-model="guest.PhoneNumber" maxlength="15" @input="formatPhone" :rules="[rules.phone]"
                        label="Telefone"></v-text-field>
                </v-form>

                <v-btn block size="large" color="primary" @click="onSave" :loading="loading" :disabled="!valid">
                    Cadastrar
                </v-btn>
            </v-col>
        </v-row>

        <v-snackbar v-model="snack.show" timeout="4000" :color="snack.color">
            {{ snack.message }}
        </v-snackbar>
    </v-container>
</template>