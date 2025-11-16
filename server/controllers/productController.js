// server/controllers/productController.js
const db = require("../models/index");
const { Product, Category, ProductVariant, Sequelize } = db;
const { Op } = db.Sequelize;
const sequelize = db.sequelize; 
const defaultPage = 1;
const defaultLimit = 10;

const includeVariants = {
  model: ProductVariant,
  as: 'variants',
};

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
        includeVariants,
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
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
        includeVariants,
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
  const t = await sequelize.transaction();
  try {
    const { name, description, category_id, variants } = req.body;
    const files = req.files;

    if (
      !name ||
      !category_id ||
      !files ||
      !files.thumbnail ||
      files.thumbnail.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Nama, Kategori, dan Thumbnail wajib diisi." });
    }

    let parsedVariants = [];
    if (typeof variants === 'string') {
        try {
            parsedVariants = JSON.parse(variants);
        } catch(e) {
            return res.status(400).json({ message: "Format data Varian tidak valid (JSON)." });
        }
    } else if (Array.isArray(variants)) {
        parsedVariants = variants;
    }

    if (!parsedVariants || parsedVariants.length === 0) {
        return res.status(400).json({ message: "Produk harus memiliki setidaknya satu varian (harga/stok)." });
    }
    
    for(const v of parsedVariants) {
        if (v.price === undefined || v.stock === undefined) {
            return res.status(400).json({ message: "Setiap varian harus memiliki 'price' dan 'stock'." });
        }
    }

    const category = await Category.findByPk(category_id, { transaction: t });
    if (!category) {
      await t.rollback();
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
      category_id: parseInt(category_id),
      thumbnail_url,
      image_url:
        image_url_array.length > 0 ? JSON.stringify(image_url_array) : null,
    }, { transaction: t });

    const variantsData = parsedVariants.map(v => ({
      product_id: newProduct.id,
      color: v.color || null,
      size: v.size || null,
      price: parseFloat(v.price),
      stock: parseInt(v.stock) || 0,
      sku: v.sku || null,
    }));

    await ProductVariant.bulkCreate(variantsData, { transaction: t });

    await t.commit();

    const finalProduct = await Product.findByPk(newProduct.id, {
        include: [includeVariants, 'category']
    });

    res.status(201).json({
      message: "Produk dan variannya berhasil dibuat.",
      product: finalProduct,
    });

  } catch (error) {
    await t.rollback();
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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const {
      name,
      description,
      category_id,
      existing_images,
      existing_thumbnail,
      variants,
    } = req.body;
    const files = req.files;

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    const updateData = { name, description };

    if (files && files.thumbnail && files.thumbnail.length > 0) {
      updateData.thumbnail_url = `/uploads/products/${files.thumbnail[0].filename}`;
    } else if (existing_thumbnail !== undefined) {
      updateData.thumbnail_url = existing_thumbnail;
    }

    let currentImages = [];
    try {
      if (typeof existing_images === 'string') {
        currentImages = existing_images ? JSON.parse(existing_images) : [];
      } else if (Array.isArray(existing_images)) {
        currentImages = existing_images;
      }
    } catch (e) { console.error("Error parsing existing_images:", e); }

    if (files && files.images) {
      const newImageUrls = files.images.map(
        (file) => `/uploads/products/${file.filename}`
      );
      currentImages = currentImages.concat(newImageUrls);
    }
    updateData.image_url =
      currentImages.length > 0 ? JSON.stringify(currentImages) : null;

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id, { transaction: t });
      if (!category) {
        await t.rollback();
        return res.status(400).json({ message: "Kategori tidak valid." });
      }
      updateData.category_id = parseInt(category_id);
    }

    await product.update(updateData, { transaction: t });

    let parsedVariants = [];
     if (typeof variants === 'string') {
        try {
            parsedVariants = JSON.parse(variants);
        } catch(e) {
             await t.rollback();
            return res.status(400).json({ message: "Format data Varian tidak valid (JSON)." });
        }
    } else if (Array.isArray(variants)) {
        parsedVariants = variants;
    }
    
    if (!parsedVariants || parsedVariants.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "Produk harus memiliki setidaknya satu varian." });
    }

    const incomingVariantIds = parsedVariants.filter(v => v.id).map(v => v.id);

    await ProductVariant.destroy({
      where: {
        product_id: id,
        id: { [Op.notIn]: incomingVariantIds }
      },
      transaction: t
    });

    for (const v of parsedVariants) {
       if (v.price === undefined || v.stock === undefined) {
            await t.rollback();
            return res.status(400).json({ message: `Varian (Color: ${v.color}, Size: ${v.size}) harus punya 'price' dan 'stock'.` });
        }
        
      const variantData = {
        product_id: id,
        color: v.color || null,
        size: v.size || null,
        price: parseFloat(v.price),
        stock: parseInt(v.stock) || 0,
        sku: v.sku || null,
      };

      if (v.id) {
        await ProductVariant.update(variantData, {
          where: { id: v.id, product_id: id },
          transaction: t
        });
      } else {
        await ProductVariant.create(variantData, { transaction: t });
      }
    }

    await t.commit();
    
    const updatedProduct = await Product.findByPk(id, {
        include: [includeVariants, 'category']
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui.",
      product: updatedProduct,
    });

  } catch (error) {
    await t.rollback();
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

    res.status(200).json({ message: "Produk dan variannya berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Gagal menghapus produk karena kesalahan server.",
      error: error.message,
    });
  }
};