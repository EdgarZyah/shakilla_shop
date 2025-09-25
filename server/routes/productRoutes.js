const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const formidable = require("express-formidable");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

// Helper untuk menghapus file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') { // Jangan error jika file tidak ada
      console.warn(`Gagal menghapus file ${filePath}:`, err);
    }
  }
};

// Mendapatkan semua produk dengan data kategori terkait
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Category,
        attributes: ['name']
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// Mendapatkan satu produk berdasarkan ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: {
        model: Category,
        attributes: ['name']
      }
    });
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
});

// Endpoint untuk menambahkan produk baru dengan thumbnail dan multiple gambar
router.post("/products", formidable({ multiples: true }), async (req, res) => {
  try {
    const { name, price, description, category_id, stock } = req.fields; // <-- Ditambahkan `stock`
    const thumbnail = req.files.thumbnail;
    const images = req.files.images;

    if (!name || !price || !description || !category_id || !thumbnail || !stock) {
      return res.status(400).json({ message: "Nama, harga, deskripsi, kategori, thumbnail, dan stok wajib diisi." });
    }

    const uploadDir = path.join(__dirname, "../../client/uploads/products");
    await fs.mkdir(uploadDir, { recursive: true });

    // Handle thumbnail upload
    const thumbnailName = `${Date.now()}-${thumbnail.originalFilename || thumbnail.name}`;
    const thumbnailPath = path.join(uploadDir, thumbnailName);
    await fs.copyFile(thumbnail.filepath || thumbnail.path, thumbnailPath);
    await deleteFile(thumbnail.filepath || thumbnail.path);
    const thumbnailUrl = `/uploads/products/${thumbnailName}`;

    // Handle multiple images upload
    const imageUrls = [];
    if (images) {
      const filesToProcess = Array.isArray(images) ? images : [images];
      if (filesToProcess.length + existingImageUrls.length > 4) {
        return res.status(400).json({ message: `Maksimal 4 gambar utama diperbolehkan.` });
      }

      for (const image of filesToProcess) {
        const fileName = `${Date.now()}-${image.originalFilename || image.name}`;
        const newPath = path.join(uploadDir, fileName);
        await fs.copyFile(image.filepath || image.path, newPath);
        await deleteFile(image.filepath || image.path);
        imageUrls.push(`/uploads/products/${fileName}`);
      }
    }

    const newProduct = await Product.create({
      name,
      price,
      description,
      category_id,
      thumbnail_url: thumbnailUrl,
      image_url: imageUrls,
      stock, // <-- Menyimpan nilai stok
    });

    res.status(201).json({ message: "Produk berhasil ditambahkan!", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Gagal menambahkan produk", error: err.message });
  }
});

// Endpoint untuk memperbarui produk
router.put("/products/:id", formidable({ multiples: true }), async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, category_id, existing_images, stock } = req.fields; // <-- Ditambahkan `stock`
    const newThumbnail = req.files.thumbnail;
    const newImages = req.files.images;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    let existingImageUrls = JSON.parse(existing_images || "[]");
    let thumbnail_url = product.thumbnail_url;
    
    const uploadDir = path.join(__dirname, "../../client/uploads/products");
    await fs.mkdir(uploadDir, { recursive: true });

    // Handle thumbnail update
    if (newThumbnail) {
      // Hapus thumbnail lama jika ada
      if (product.thumbnail_url) {
        await deleteFile(path.join(__dirname, "../../client", product.thumbnail_url));
      }
      const thumbnailName = `${Date.now()}-${newThumbnail.originalFilename || newThumbnail.name}`;
      const thumbnailPath = path.join(uploadDir, thumbnailName);
      await fs.copyFile(newThumbnail.filepath || newThumbnail.path, thumbnailPath);
      await deleteFile(newThumbnail.filepath || newThumbnail.path);
      thumbnail_url = `/uploads/products/${thumbnailName}`;
    }

    // Handle multiple images update
    if (newImages) {
      const filesToProcess = Array.isArray(newImages) ? newImages : [newImages];
      if (filesToProcess.length + existingImageUrls.length > 4) {
        return res.status(400).json({ message: `Maksimal 4 gambar utama diperbolehkan. Anda mencoba menambahkan ${filesToProcess.length} gambar dengan ${existingImageUrls.length} yang sudah ada.` });
      }

      for (const image of filesToProcess) {
        const fileName = `${Date.now()}-${image.originalFilename || image.name}`;
        const newPath = path.join(uploadDir, fileName);
        await fs.copyFile(image.filepath || image.path, newPath);
        await deleteFile(image.filepath || image.path);
        existingImageUrls.push(`/uploads/products/${fileName}`);
      }
    }
    
    product.name = name;
    product.price = price;
    product.description = description;
    product.category_id = category_id;
    product.thumbnail_url = thumbnail_url;
    product.image_url = existingImageUrls;
    product.stock = stock; // <-- Memperbarui nilai stok

    await product.save();

    res.status(200).json({ message: "Produk berhasil diperbarui!", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Gagal memperbarui produk", error: err.message });
  }
});

// Endpoint untuk menghapus produk
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // Hapus file gambar terkait dari sistem file
    if (product.thumbnail_url) {
        await deleteFile(path.join(__dirname, "../../client", product.thumbnail_url));
    }
    if (product.image_url && product.image_url.length > 0) {
      for (const imageUrl of product.image_url) {
        await deleteFile(path.join(__dirname, "../../client", imageUrl));
      }
    }

    await product.destroy();

    res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Gagal menghapus produk", error: err.message });
  }
});

module.exports = router;