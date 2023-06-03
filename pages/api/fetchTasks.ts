import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import unzipper from "unzipper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { archiveName, markdownFilePath } = req.query as {
    archiveName: string;
    markdownFilePath: string;
  };

  try {
    const archiveUrl = `https://storage.yandexcloud.net/contest-bucket/contestTasks/${archiveName}.zip`;

    const response = await fetch(archiveUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractFolderPath = await unzipper.Open.buffer(buffer);
    const markdownFile = extractFolderPath.files.find(
      (file) => file.path === markdownFilePath
    );

    if (!markdownFile) {
      throw new Error(`${markdownFilePath} not found in the archive.`);
    }

    const markdownBuffer = await markdownFile.buffer();
    const markdownContent = markdownBuffer.toString();

    const imageFiles = extractFolderPath.files.filter((file) =>
      file.path.match(/\.(jpeg|jpg|png|gif)$/i)
    );

    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const imageBuffer = await file.buffer();
        const base64 = imageBuffer.toString("base64");
        const mimeType = file.path.split(".").pop();

        return {
          path: file.path,
          url: `data:image/${mimeType};base64,${base64}`,
        };
      })
    );

    res.status(200).json({ markdownContent, imageUrls });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}
