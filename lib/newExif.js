const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { tmpdir } = require("os");

function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
	return new Promise(async (resolve, reject) => {
		try {
		  const tmp = path.join(
        tmpdir(),
        `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`
      );
      const out = path.join(
        tmpdir(),
        `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
      );
			await fs.promises.writeFile(tmp, buffer);
			spawn("ffmpeg", ["-y", "-i", tmp, ...args, out])
				.on("error", reject)
				.on("close", async (code) => {
					try {
						await fs.promises.unlink(tmp);
						if (code !== 0) return reject(code);
						resolve(await fs.promises.readFile(out));
						await fs.promises.unlink(out);
					} catch (e) {
						reject(e);
					}
				});
		} catch (e) {
			reject(e);
		}
	});
}

async function imageToSticker(media) {
  try {
    const tmpFilePath = path.join(__dirname, "../temp", +new Date() + ".jpg");
    await fs.promises.writeFile(tmpFilePath, media);
    
    const args = [
      "-y", "-i", tmpFilePath,
      "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
      tmpFilePath + ".webp"
    ];

    return await ffmpeg(fs.readFileSync(tmpFilePath), args, "jpg", "webp");
  } catch (error) {
    console.error("Error al convertir a sticker:", error);
    throw error;
  }
}

module.exports = {
	ffmpeg,
	imageToSticker
};
