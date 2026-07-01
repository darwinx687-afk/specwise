const MATERIAL_TYPES = ["mock_screenshot", "image", "markdown", "text", "csv", "xlsx", "unsupported"];

export function summarizeMaterials(materials) {
  const byType = Object.fromEntries(MATERIAL_TYPES.map((type) => [type, 0]));

  for (const material of materials) {
    byType[material.type] = (byType[material.type] ?? 0) + 1;
  }

  const unsupportedFiles = byType.unsupported;

  return {
    totalFiles: materials.length,
    supportedFiles: materials.length - unsupportedFiles,
    unsupportedFiles,
    byType
  };
}

