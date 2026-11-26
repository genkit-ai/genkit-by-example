import { z } from "genkit";

export const ImageObjectSchema = z.object({
  name: z.string().describe("a short but unique name of the object"),
  description: z
    .string()
    .describe("a single sentence detailed description of the object"),
  text: z.string().describe("any written text on the object").nullish(),
  colors: z
    .array(z.string())
    .describe(
      "a list of one or more valid CSS named colors that make up the object, from most to least prevalent"
    ),
  box2d: z
    .array(z.number())
    .describe("bounding box for the object in [y1,x1,y2,x2] format"),
});

export type ImageObject = z.infer<typeof ImageObjectSchema>;

const MAX_IMAGE_DATA_URI_CHARS = 6_000_000; // ~4.5 MB decoded

export const ImageAnalysisRequestSchema = z.object({
  system: z
    .array(z.object({ text: z.string().max(1_000) }))
    .max(4)
    .optional(),
  imageUrl: z
    .string()
    .max(MAX_IMAGE_DATA_URI_CHARS, "Image exceeds maximum allowed size.")
    .regex(
      /^data:image\/(png|jpeg|jpg|webp|gif);base64,/,
      "Only base64-encoded PNG, JPEG, WebP, or GIF data URIs are allowed."
    ),
});
