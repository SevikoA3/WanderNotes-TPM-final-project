import * as FileSystem from "expo-file-system";

export async function copyImageToAppDir(pickedUri: string): Promise<string> {
  const fileName = pickedUri.split("/").pop() || `image_${Date.now()}.jpg`;
  if (!FileSystem.documentDirectory)
    throw new Error("File system not available.");
  const newPath = FileSystem.documentDirectory + fileName;
  await FileSystem.copyAsync({ from: pickedUri, to: newPath });
  return newPath;
}

export default {};
