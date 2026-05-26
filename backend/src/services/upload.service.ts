import cloudinary from "../lib/cloudinary.js";

export class UploadService {
  async uploadAvatar(file: Express.Multer.File, folder: string = "avatars"): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error || !result) {
            console.error("Erro Cloudinary:", error); // adiciona isso
            reject(new Error("Erro ao fazer upload da imagem"));
            return;
          }
          resolve(result.secure_url);
        }
      ).end(file.buffer);
    });
  }

  async deleteAvatar(url: string): Promise<void> {
    const publicId = url.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  }
}