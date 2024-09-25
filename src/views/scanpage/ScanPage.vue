<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Quagga from 'quagga'
import { eventService } from '@/services'

// function goTo(url) {
//   window.location = url
// }

const scanType = ref("CHECK-IN")
const codeDetected = ref(false)
const result = ref(null)
const error = ref(null)
const videoRef = ref();
const stream = ref();
const devices = ref([]);
const selectedDeviceId = ref('');
const videoStarted = ref(false);
const lastId = ref();

function toggleScanType () {
  lastId.value = null
  scanType.value = scanType.value == "CHECK-IN" ? "CHECK-OUT" : "CHECK-IN"
}

async function getDevices () {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true })

    const deviceInfos = await navigator.mediaDevices.enumerateDevices();

    devices.value = deviceInfos.filter(device => device.kind == 'videoinput' && (device.label.includes("Webcam") || device.label.includes("Traseira")));

    if (devices.value.length > 0) {
      selectedDeviceId.value = devices.value[0].deviceId;
      startCamera()
    }

  } catch (error) {
    console.error('Erro ao listar dispositivos: ', error);
  }
}

async function startCamera () {
  try {
    if (selectedDeviceId.value) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId.value } }
      });
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream;
        stream.value = mediaStream;
        videoStarted.value = true;
        startScanner()
      } else {
        console.error('Elemento de vídeo não encontrado.');
      }
    }
  } catch (error) {
    console.error('Erro ao acessar a câmera: ', error);
  }
}

function stopCamera () {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
    videoStarted.value = false;
  }
}

function startScanner () {
  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: videoRef.value
    },
    decoder: {
      readers: ['code_128_reader']
    }
  }, (err) => {
    if (err) {
      error.value = err.message
      return
    }
    Quagga.start()
  })

  Quagga.onDetected((data) => {

    if (lastId.value == data.codeResult.code && !phoneIsValid(data.codeResult.code)) {
      return
    } else {
      lastId.value = result.value = data.codeResult.code
    }
  })

  Quagga.onProcessed(async (res) => {
    if (res && res.codeResult && lastId.value != res.codeResult.code) {
      result.value = res.codeResult.code
      await processScan()
    }
  })
}

onMounted(() => {
  getDevices();
});

onUnmounted(() => {
  stopCamera();
});


function phoneIsValid (phone) {
  const phoneRegex = /^\+?(\d{1,3})?[-. ]?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,9}$/;
  if (!phoneRegex.test(phone) && phone.length == 11) {
    console.log('invalid phone', phone);
  }

  return phoneRegex.test(phone) && phone.length == 11
}

const success = ref()

async function processScan () {
  if (!phoneIsValid(result.value)) {
    return
  }

  codeDetected.value = true

  if (scanType.value == 'CHECK-IN') {
    await onCheckin(result.value)

  } else {
    await onCheckout(result.value)
  }

  setTimeout(() => { codeDetected.value = false }, 2000)
}

async function onCheckin (id) {
  console.log(id, 'checkin');

  try {
    let res = await eventService.put(`/check-in/${id}`)

    if (res.status == 404) {
      success.value = false
      console.log(id, 'not found guest');
      return
    }

    success.value = true
  } catch {
    success.value = false
    console.log(id, 'checkin error');
  }
}

async function onCheckout (id) {
  console.log(id, 'checkout');

  try {
    let res = await eventService.put(`/check-out/${id}`)

    if (res.status == 404) {
      success.value = false
      console.log(id, 'not found guest');
      return
    }

    success.value = true
  } catch {
    success.value = false
    console.log(id, 'checkout error');
  }
}

</script>

<template>
  <div class="scanner-container">

    <v-progress-circular v-if="!stream" class="check-overlay" indeterminate></v-progress-circular>

    <div class="video-container">
      <video ref="videoRef" autoplay playsinline></video>
    </div>

    <p v-if="stream" :class="['text-video', codeDetected ? success ? 'text-wrapper' : 'text-error-wrapper' : '']">{{ scanType }}</p>

    <div v-if="codeDetected" class="check-overlay">
      <div :class="success ? 'check-wrapper' : 'error-wrapper'">
        <svg viewBox="0 0 24 24" :class="success ? 'check-icon' : 'error-icon'">
          <path v-if="success" fill="currentColor" d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z" />

          <path v-else fill="currentColor"
            d="M18.36 6.64l-1.41-1.41L12 10.59 7.05 5.64 5.64 7.05 10.59 12l-4.95 4.95 1.41 1.41L12 13.41l4.95 4.95 1.41-1.41L13.41 12l4.95-4.95z" />
        </svg>
      </div>
    </div>

  </div>

  <v-container v-if="stream" class="button-container">
    <v-row class="justify-center">
      <v-btn @click="toggleScanType" class="mr-4" size="large" color="secondary">
        {{ scanType == "CHECK-IN" ? "CHECK-OUT" : "CHECK-IN" }}
      </v-btn>
    </v-row>
  </v-container>

</template>
<style>
.scanner-container {
  width: 90vw;
  transition: border-color 0.5s ease;
}

.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-container video {
  width: 100vh;
  height: 100vh;
}

.video-container::before,
.video-container::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.video-container::before {
  top: 0;
  height: 30%;
}

.video-container::after {
  bottom: 0;
  height: 40%;
}

.video-container::before,
.video-container::after {
  pointer-events: none;
}

.check-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fade-in-out 2s ease-in-out;
}

.check-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  background-color: rgba(40, 167, 69, 0.1);
  border: 4px solid #28a745;
  border-radius: 20px;
}

.check-icon {
  width: 60px;
  height: 60px;
  color: #28a745;
}

.error-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  background-color: rgba(167, 40, 40, 0.1);
  border: 4px solid #a72828;
  border-radius: 20px;
}

.error-icon {
  width: 60px;
  height: 60px;
  color: #a72828;
}

.button-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 16px;
  box-sizing: border-box;
}

.v-btn {
  color: white;
}

@keyframes fade-in-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.8);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

.text-video {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 4px;
}

.text-wrapper {
  background-color: rgba(18, 230, 67, 0.397);
}

.text-error-wrapper {
  background-color: rgba(230, 18, 18, 0.397);
}
</style>
