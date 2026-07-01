import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

export function getMaterialType(fileName) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".mock.txt")) return "mock_screenshot";

  const extension = path.extname(lowerName);
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (extension === ".md") return "markdown";
  if (extension === ".txt") return "text";
  if (extension === ".csv") return "csv";
  if (extension === ".xlsx") return "xlsx";
  return "unsupported";
}

export function getMaterialExtension(fileName) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".mock.txt")) return ".mock.txt";
  return path.extname(fileName);
}

