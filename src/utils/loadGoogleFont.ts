import { readFile } from "node:fs/promises";
import { join } from "node:path";

function toArrayBuffer(buffer: Buffer<ArrayBufferLike>): ArrayBuffer {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

async function loadGoogleFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>
> {
  const fontsConfig = [
    {
      name: "DejaVu Sans Mono",
      path: "src/assets/fonts/DejaVuSansMono-Regular.ttf",
      weight: 400,
      style: "normal",
    },
    {
      name: "DejaVu Sans Mono",
      path: "src/assets/fonts/DejaVuSansMono-Bold.ttf",
      weight: 700,
      style: "normal",
    },
  ];

  const fonts = await Promise.all(
    fontsConfig.map(async ({ name, path, weight, style }) => {
      const file = await readFile(join(process.cwd(), path));
      const data = toArrayBuffer(file);
      return { name, data, weight, style };
    })
  );

  return fonts;
}

export default loadGoogleFonts;
