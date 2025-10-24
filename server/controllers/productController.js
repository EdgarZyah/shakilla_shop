// server/controllers/productController.js
const db = require("../models/index");
const { Product, Category } = db;
const { Op } = db.Sequelize;

// Konfigurasi pagination default
const defaultPage = 1;
const defaultLimit = 10;

// [PUBLIC] Ambil semua produk dengan filter dan pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = defaultPage,
      limit = defaultLimit,
      search = "",
      category_id,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id) {
      whereCondition.category_id = category_id;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereCondition,
      limit: limitNum,
      offset: offset,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      products,
      totalItems: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil produk.", error: error.message });
  }
};

// [PUBLIC] Ambil detail produk berdasarkan ID
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    res.status(200).json({ product });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal mengambil detail produk.",
        error: error.message,
      });
  }
};

// [ADMIN] Tambah Produk Baru
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const files = req.files;

    if (
      !name ||
      !price ||
      !category_id ||
      !files ||
      !files.thumbnail ||
      files.thumbnail.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Nama, Harga, Kategori, dan Thumbnail wajib diisi." });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ message: "Kategori tidak valid." });
    }

    const thumbnailFile = files.thumbnail[0].filename;
    const thumbnail_url = `/uploads/products/${thumbnailFile}`;

    const image_url_array = files.images
      ? files.images.map((file) => `/uploads/products/${file.filename}`)
      : [];

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: parseInt(category_id),
      thumbnail_url,
      image_url:
        image_url_array.length > 0 ? JSON.stringify(image_url_array) : null,
    });

    res.status(201).json({
      message: "Produk berhasil dibuat.",
      product: newProduct,
    });
  } catch (error) {
    if (
      error.name === "MulterError" ||
      error.message.includes("Hanya file gambar")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat produk.", error: error.message });
  }
};

// [ADMIN] Update Produk
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      category_id,
      existing_images,
      existing_thumbnail,
    } = req.body;
    const files = req.files;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const updateData = { name, description };

    // Handle Thumbnail
    if (files && files.thumbnail && files.thumbnail.length > 0) {
      updateData.thumbnail_url = `/uploads/products/${files.thumbnail[0].filename}`;
    } else if (existing_thumbnail !== undefined) {
      updateData.thumbnail_url = existing_thumbnail;
    }

    // Handle Images
    let currentImages = [];
    try {
      currentImages = existing_images ? JSON.parse(existing_images) : [];
    } catch (e) {
      console.error("Error parsing existing_images:", e);
    }

    if (files && files.images) {
      const newImageUrls = files.images.map(
        (file) => `/uploads/products/${file.filename}`
      );
      currentImages = currentImages.concat(newImageUrls);
    }

    updateData.image_url =
      currentImages.length > 0 ? JSON.stringify(currentImages) : null;

    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ message: "Kategori tidak valid." });
      }
      updateData.category_id = parseInt(category_id);
    }

    await product.update(updateData);

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui.",
      product: updatedProduct,
    });
  } catch (error) {
    if (
      error.name === "MulterError" ||
      error.message.includes("Hanya file gambar")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui produk.", error: error.message });
  }
};

// [ADMIN] Update Produk
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      category_id,
      existing_images,
      existing_thumbnail,
    } = req.body;
    const files = req.files;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const updateData = { name, description };

    // Handle Thumbnail
    if (files && files.thumbnail && files.thumbnail.length > 0) {
      updateData.thumbnail_url = `/uploads/products/${files.thumbnail[0].filename}`;
    } else if (existing_thumbnail !== undefined) {
      updateData.thumbnail_url = existing_thumbnail;
    }

    // Handle Images
    let currentImages = [];
    try {
      currentImages = existing_images ? JSON.parse(existing_images) : [];
    } catch (e) {
      console.error("Error parsing existing_images:", e);
    }

    if (files && files.images) {
      const newImageUrls = files.images.map(
        (file) => `/uploads/products/${file.filename}`
      );
      currentImages = currentImages.concat(newImageUrls);
    }

    updateData.image_url =
      currentImages.length > 0 ? JSON.stringify(currentImages) : null;

    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ message: "Kategori tidak valid." });
      }
      updateData.category_id = parseInt(category_id);
    }

    await product.update(updateData);

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui.",
      product: updatedProduct,
    });
  } catch (error) {
    if (
      error.name === "MulterError" ||
      error.message.includes("Hanya file gambar")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui produk.", error: error.message });
  }
};
// [ADMIN] Hapus Produk
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Product.destroy({ where: { id } });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message:
          "Gagal menghapus produk karena data ini sudah terkait dengan pesanan atau keranjang pelanggan.",
      });
    }

    res.status(500).json({
      message: "Gagal menghapus produk karena kesalahan server.",
      error: error.message,
    });
  }
};
