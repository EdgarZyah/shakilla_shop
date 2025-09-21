const express = require("express");
const HeroContent = require("../models/heroContent");
const formidable = require("express-formidable");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

// Helper untuk menghapus file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn(`Gagal menghapus file ${filePath}:`, err);
    }
  }
};

// Mendapatkan semua konten hero (carousel, banner)
router.get("/hero-content", async (req, res) => {
  try {
    const content = await HeroContent.findAll({
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.json(content);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching hero content", error: err.message });
  }
});

// Memperbarui banner kiri
router.put(
  "/hero-content/banner_left",
  formidable({ multiples: true }),
  async (req, res) => {
    try {
      const { title, description, button_text, link } = req.fields;
      const newImage = req.files.image;

      const banner = await HeroContent.findOne({
        where: { type: "banner_left" },
      });
      if (!banner) {
        return res.status(404).json({ message: "Banner tidak ditemukan." });
      }

      // Hapus file lama jika ada file baru diunggah
      if (newImage && banner.image_url) {
        await deleteFile(path.join(__dirname, "../../client", banner.image_url));
      }

      let imageUrl = banner.image_url;
      if (newImage) {
        const uploadDir = path.join(__dirname, "../../client/uploads/banner");
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${newImage.originalFilename || newImage.name}`;
        const newPath = path.join(uploadDir, fileName);
        await fs.copyFile(newImage.filepath || newImage.path, newPath);
        await deleteFile(newImage.filepath || newImage.path);
        imageUrl = `/uploads/banner/${fileName}`;
      }

      banner.title = title;
      banner.description = description;
      banner.button_text = button_text;
      banner.link = link;
      banner.image_url = imageUrl;
      await banner.save();

      res.status(200).json({ message: "Banner kiri berhasil diperbarui!", banner });
    } catch (err) {
      console.error("Error updating banner:", err);
      res
        .status(500)
        .json({ message: "Gagal memperbarui banner", error: err.message });
    }
  }
);

// Memperbarui banner kanan
router.put(
  "/hero-content/banner_right",
  formidable({ multiples: true }),
  async (req, res) => {
    try {
      const { title, description, button_text, link } = req.fields;
      const newImage = req.files.image;

      const banner = await HeroContent.findOne({
        where: { type: "banner_right" },
      });
      if (!banner) {
        return res.status(404).json({ message: "Banner tidak ditemukan." });
      }

      // Hapus file lama jika ada file baru diunggah
      if (newImage && banner.image_url) {
        await deleteFile(path.join(__dirname, "../../client", banner.image_url));
      }

      let imageUrl = banner.image_url;
      if (newImage) {
        const uploadDir = path.join(__dirname, "../../client/uploads/banner");
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${newImage.originalFilename || newImage.name}`;
        const newPath = path.join(uploadDir, fileName);
        await fs.copyFile(newImage.filepath || newImage.path, newPath);
        await deleteFile(newImage.filepath || newImage.path);
        imageUrl = `/uploads/banner/${fileName}`;
      }
      
      banner.title = title;
      banner.description = description;
      banner.button_text = button_text;
      banner.link = link;
      banner.image_url = imageUrl;
      await banner.save();

      res.status(200).json({ message: "Banner kanan berhasil diperbarui!", banner });
    } catch (err) {
      console.error("Error updating banner:", err);
      res
        .status(500)
        .json({ message: "Gagal memperbarui banner", error: err.message });
    }
  }
);

// Memperbarui konten carousel
router.post(
  "/hero-content/carousel",
  formidable({ multiples: true }),
  async (req, res) => {
    try {
      const { items: itemsString } = req.fields;
      const images = req.files.images;
      if (!itemsString) {
        return res.status(400).json({ message: "Data item tidak valid." });
      }
      const carouselItems = JSON.parse(itemsString);
      const uploadDir = path.join(__dirname, "../../client/uploads/carousel");
      await fs.mkdir(uploadDir, { recursive: true });
      const oldItems = await HeroContent.findAll({
        where: { type: "carousel" },
      });
      for (const item of oldItems) {
        if (item.image_url) {
          await deleteFile(
            path.join(__dirname, "../../client", item.image_url)
          );
        }
      }
      await HeroContent.destroy({ where: { type: "carousel" } });
      const filesToProcess = Array.isArray(images) ? images : images ? [images] : [];
      if (filesToProcess.length !== carouselItems.length) {
        // Hapus file yang terlanjur di-upload jika jumlahnya tidak cocok
        for (const file of filesToProcess) {
          if (file.filepath) {
            await deleteFile(file.filepath);
          }
        }
        return res.status(400).json({ message: "Jumlah file dan data item tidak cocok." });
      }
      const newItems = [];
      for (let i = 0; i < carouselItems.length; i++) {
        const item = carouselItems[i];
        const newFile = filesToProcess[i];
        const fileName = `${Date.now()}-${newFile.originalFilename || newFile.name}`;
        const newPath = path.join(uploadDir, fileName);
        await fs.copyFile(newFile.filepath || newFile.path, newPath);
        await deleteFile(newFile.filepath || newFile.path);
        newItems.push({
          type: "carousel",
          image_url: `/uploads/carousel/${fileName}`,
          title: item.title,
          description: item.description,
          button_text: item.button_text,
          link: "",
          order_index: i,
          is_active: true,
        });
      }
      if (newItems.length > 0) {
        await HeroContent.bulkCreate(newItems);
      }
      res.status(200).json({ message: "Carousel berhasil diperbarui.", newItems });
    } catch (err) {
      console.error("Error updating hero content:", err);
      res.status(500).json({ message: "Gagal memperbarui konten hero", error: err.message });
    }
  }
);
// Endpoint untuk menghapus konten hero
router.delete("/hero-content/:id", async (req, res) => {
  try {
    const contentId = req.params.id;
    const content = await HeroContent.findByPk(contentId);
    if (!content) {
      return res.status(404).json({ message: "Konten tidak ditemukan." });
    }

    if (content.image_url) {
      await deleteFile(path.join(__dirname, "../../client", content.image_url));
    }

    await content.destroy();
    res.status(200).json({ message: "Konten berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting content:", err);
    res
      .status(500)
      .json({ message: "Gagal menghapus konten", error: err.message });
  }
});

module.exports = router;