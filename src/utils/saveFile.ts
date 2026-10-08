import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

let toastNotifier: ((msg: string) => void) | null = null;

export function registerToastNotifier(fn: (msg: string) => void) {
  toastNotifier = fn;
}

function notify(message: string) {
  if (toastNotifier) {
    toastNotifier(message);
    return;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axon-toast', { detail: message }));
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return await response.blob();
}

export async function saveFile(blob: Blob, fileName: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // Browser behavior: keep the normal download exactly as before
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  // Native Android behavior: save directly to phone storage, no confirmation dialog
  try {
    try {
      await Filesystem.requestPermissions();
    } catch (e) {
      /* ignore, newer Android does not need it */
    }
    const data = await blobToBase64(blob);
    const safeName = fileName.replace(/[\\/:*?"<>|]/g, '_');
    await Filesystem.writeFile({
      path: 'Axon/' + safeName,
      data,
      directory: Directory.Documents,
      recursive: true,
    });
    notify('Saved to Documents/Axon/' + safeName);
  } catch (err) {
    notify('Could not save file: ' + (err && (err as any).message ? (err as any).message : String(err)));
  }
}
