import { imageSize } from "image-size";

const TYPE_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateImageUpload(body: Buffer, contentType: string) {
  const expectedType = TYPE_BY_MIME[contentType];
  if (!expectedType) throw new Error("Unsupported image type.");

  let dimensions;
  try {
    dimensions = imageSize(body);
  } catch {
    throw new Error("The uploaded file is not a valid image.");
  }

  if (dimensions.type !== expectedType) throw new Error("The image content does not match its file type.");
  const width = Number(dimensions.width);
  const height = Number(dimensions.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("The uploaded image has invalid dimensions.");
  }
  if (width > 12_000 || height > 12_000 || width * height > 80_000_000) {
    throw new Error("The uploaded image dimensions are too large.");
  }
  return { width, height, type: dimensions.type };
}
