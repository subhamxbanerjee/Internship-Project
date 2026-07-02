// src/utils/pptxParser.ts
import JSZip from "jszip";

export async function parsePptxSlides(buffer: ArrayBuffer): Promise<string[][]> {
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
      return numA - numB;
    });

  const parser = new DOMParser();
  const slides: string[][] = [];

  for (const name of slideFiles) {
    const xml = await zip.files[name].async("text");
    const doc = parser.parseFromString(xml, "application/xml");
    const textNodes = Array.from(doc.getElementsByTagName("a:t"));
    const texts = textNodes
      .map((n) => n.textContent?.trim() || "")
      .filter((t) => t.length > 0);
    slides.push(texts);
  }

  return slides;
}