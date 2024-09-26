import QRCodeStyling from 'qr-code-styling';
import { onMounted, Ref, ref, watch } from 'vue';

export default function useQRCode(link: Ref<string>, color: Ref<string> = ref('#000'), background = 'white') {
    const generating = ref(false);
    const qrCode = ref<HTMLImageElement | undefined>();

    onMounted(() => generateQR());
    watch([color, background, link], () => generateQR());

    const codeObj = ref<QRCodeStyling>();
    const generateQR = async (width = 1080) => {
        if (!link.value) {
            return;
        }
        generating.value = true;
        codeObj.value = new QRCodeStyling({
            width: width,
            height: width,
            data: link.value,
            margin: 5,
            image: 'https://feg-karlsruhe.church.tools/logo',
            dotsOptions: {
                color: color.value,
                type: 'rounded',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 50,
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
                color: background,
            },
        });
    };

    return { generateQR, generating, qrCode, codeObj };
}
