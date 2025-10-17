
import type { Scene } from '../types';
declare const JSZip: any;

export function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function downloadImagesAsZip(scenes: Scene[], filename: string) {
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not found. Cannot download images.');
        return;
    }
    const zip = new JSZip();
    
    scenes.forEach(scene => {
        if (scene.keyframe_image_base64) {
            const imageName = `scene_${scene.scene_number.toString().padStart(3, '0')}.png`;
            // JSZip expects the base64 data without the data URI prefix
            zip.file(imageName, scene.keyframe_image_base64, { base64: true });
        }
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to create zip file', e);
        alert('Failed to create zip file. See console for details.');
    }
}
