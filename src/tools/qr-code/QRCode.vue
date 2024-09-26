<script setup lang="ts">
import { Card, ContentWrapper, Input } from '@churchtools/styleguide';
import QRCodeStyling from 'qr-code-styling';
import { computed, onMounted, ref, watch } from 'vue';
import { isValidUrl, txx } from '../../utils';

const link = ref('https://church.tools');
const color = ref('#000000');
const background = ref('#ffffff');
const fileName = ref('');
const width = ref(400);

const logoUrl = 'https://feg-karlsruhe.church.tools/logo';
const logoLoaded = ref(false);
const logoData = ref('');
const loadLogo = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = logoUrl;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = color.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(img, 0, 0);
        logoData.value = canvas.toDataURL();
    };
};

const options = computed(() => ({
    width: width.value,
    height: width.value,
    data: link.value,
    margin: 5,
    image: logoData.value,
    dotsOptions: {
        color: color.value,
        type: 'rounded',
    },
    imageOptions: {
        crossOrigin: 'anonymous',
        margin: width.value / 30,
        imageSize: 0.5,
    },
    cornersSquareOptions: {
        color: color.value,
    },
    cornersDotOptions: {
        color: color.value,
        type: 'square',
    },
    backgroundOptions: {
        color: background.value,
    },
}));

watch(color, () => {
    loadLogo();
});
watch(
    [options, logoLoaded],
    () => {
        qrCode.value.update(options.value);
    },
    { deep: true },
);
const qrCode = ref(new QRCodeStyling(options.value));
onMounted(() => {
    loadLogo();
    qrCode.value.append(document.getElementById('canvas'));
});

const name = computed(() => {
    if (!isValidUrl(link.value)) {
        return '';
    }
    const url = new URL(link.value);
    const email = (link: string) => {
        const email = link.split('mailto:')[1];
        return email ? email.split('?')[0] : '';
    };
    if (url.protocol === 'mailto:') {
        return email(link.value);
    }
    return url.hostname.replace('www.', '');
});
</script>
<template>
    <ContentWrapper color="accent" icon="fas fa-qrcode" max-width :title="txx('QR-Codes')">
        <div class="flex flex-col gap-4">
            <Input v-model="link" :label="txx('Link')" />
            <div class="grid grid-cols-2 gap-4">
                <Card style="--card-px: 8px; --card-py: 8px" class="mt-6">
                    <div id="canvas"></div>
                </Card>
                <img :src="logoUrl" />
                <div class="flex flex-col gap-4">
                    <div>
                        <Input v-model="width" :label="txx('Größe')" />
                    </div>
                    <div class="flex gap-4">
                        <div class="flex flex-col">
                            <label class="text-body-m-emphasized">{{ txx('Farbe') }}</label>
                            <input v-model="color" type="color" />
                        </div>
                        <div class="flex flex-col">
                            <label class="text-body-m-emphasized">{{ txx('Hintergrund') }}</label>
                            <input v-model="background" type="color" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<style scoped>
:deep(#canvas canvas) {
    width: 100%;
    height: 100%;
}
</style>
