// server/controllers/orderController.js
const db = require("../models/index");
const ExcelJS = require("exceljs");

const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  Payment,
  User,
} = db;
const { sequelize } = db;
const { Op } = db.Sequelize;

const orderIncludeOptions = (includeUser = false) => {
  const includes = [
    {
      model: OrderItem,
      as: "items",
      required: false,
      include: [
        {
          model: ProductVariant,
          as: "productVariant",
          required: false,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "thumbnail_url"],
            },
          ],
        },
      ],
    },
    {
      model: Payment,
      as: "payment",
    },
  ];

  if (includeUser) {
    includes.push({
      model: User,
      as: "user",
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "address",
        "phone_number",
        "zip_code",
        "username",
      ],
    });
  }

  return includes;
};

// --- Fungsi Checkout ---
exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shipping_address, shipping_method, shipping_cost } = req.body;

    if (!shipping_address) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Alamat pengiriman wajib diisi." });
    }
    const parsedShippingCost = parseFloat(shipping_cost);
    if (!shipping_method || shipping_method.trim() === "") {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Metode pengiriman harus dipilih." });
    }
    if (isNaN(parsedShippingCost) || parsedShippingCost < 0) {
      await t.rollback();
      return res.status(400).json({ message: "Biaya ongkir tidak valid." });
    }

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              include: [{ model: Product, as: "product" }],
            },
          ],
        },
      ],
      transaction: t,
    });

    if (!cart || cart.items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Keranjang kosong, tidak dapat checkout." });
    }

    let total_price = 0;
    const orderItemsData = [];
    const stockUpdates = [];

    for (const item of cart.items) {
      const variant = item.productVariant;

      if (!variant) {
        await t.rollback();
        return res.status(400).json({
          message: `Checkout gagal: Varian produk (ID: ${item.product_variant_id}) tidak valid.`,
        });
      }

      const product = variant.product;
      const itemPrice = parseFloat(variant.price || 0);
      const itemStock = parseInt(variant.stock || 0);
      const itemQty = parseInt(item.quantity || 0);

      if (itemQty <= 0) {
        await t.rollback();
        return res.status(400).json({
          message: `Kuantitas untuk produk ${product.name} harus positif.`,
        });
      }

      if (itemStock < itemQty) {
        await t.rollback();
        return res.status(400).json({
          message: `Stok untuk ${product.name} (Varian: ${
            variant.color || ""
          } ${variant.size || ""}) tidak mencukupi. Sisa ${itemStock}.`,
        });
      }

      total_price += itemQty * itemPrice;

      orderItemsData.push({
        product_variant_id: variant.id,
        quantity: itemQty,
        price: itemPrice.toFixed(2),
      });

      stockUpdates.push({
        id: variant.id, 
        newStock: itemStock - itemQty,
      });
    }

    const finalSubtotal = parseFloat(total_price).toFixed(2);
    const finalShippingCost = parseFloat(parsedShippingCost).toFixed(2);
    const finalGrandTotal = (
      parseFloat(finalSubtotal) + parseFloat(finalShippingCost)
    ).toFixed(2);

    const newOrder = await Order.create(
      {
        user_id: userId,
        total_price: finalSubtotal,
        shipping_address: shipping_address,
        shipping_method: shipping_method,
        shipping_cost: finalShippingCost,
        grand_total: finalGrandTotal,
        order_status: "menunggu pembayaran",
      },
      { transaction: t }
    );

    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

    for (const update of stockUpdates) {
      await ProductVariant.update(
        { stock: update.newStock },
        { where: { id: update.id }, transaction: t }
      );
    }

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Checkout berhasil! Order menunggu pembayaran.",
      order: newOrder,
    });
  } catch (error) {
    await t.rollback();
    console.error("Checkout error:", error);
    res.status(500).json({
      message: "Checkout gagal karena kesalahan server.",
      error: error.message,
    });
  }
};

// Fetch Orders
exports.getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    let whereCondition = {};
    if (!isAdmin) {
      whereCondition.user_id = userId;
    } else if (req.query.user_id) {
      whereCondition.user_id = req.query.user_id;
    }

    const orders = await Order.findAll({
      where: whereCondition,
      include: orderIncludeOptions(true),
      order: [["created_at", "DESC"]],
    });

    if (isAdmin && !req.query.user_id) {
      return res.status(200).json(orders);
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil daftar order.", error: error.message });
  }
};

// Fetch Order Detail
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;
    const userId = req.user.id;

    let whereCondition = { id };
    if (role !== "admin") {
      whereCondition.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereCondition,
      include: orderIncludeOptions(true), 
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Pesanan tidak ditemukan atau akses ditolak." });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Get order detail error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil detail order.", error: error.message });
  }
};

// [ADMIN & USER] Mengubah Status Order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;
    const { role, id: userId } = req.user;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    if (role !== "admin") {
      if (order.user_id !== userId) {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Ini bukan pesanan Anda." });
      }
      if (order_status !== "dibatalkan") {
        return res
          .status(403)
          .json({ message: "Pengguna hanya dapat membatalkan pesanan." });
      }
      if (order.order_status !== "menunggu pembayaran") {
        return res.status(400).json({
          message: "Pesanan yang sudah diproses tidak dapat dibatalkan.",
        });
      }
    } else {
      const validAdminStatuses = [
        "menunggu verifikasi",
        "diproses",
        "dikirim",
        "diterima",
        "selesai",
        "dibatalkan",
      ];
      if (!order_status || !validAdminStatuses.includes(order_status)) {
        return res
          .status(400)
          .json({ message: `Status order tidak valid: ${order_status}` });
      }
    }

    const updateFields = { order_status };

    if (order_status === "dikirim" && !order.shipped_at) {
      if (role !== "admin" || !order.shipping_receipt_number) {
        return res.status(400).json({
          message:
            "Upload resi terlebih dahulu sebelum mengubah status menjadi 'dikirim'.",
        });
      }
      updateFields.shipped_at = new Date();
    }

    if (order_status === "diterima" && !order.received_at) {
      updateFields.received_at = new Date();
      updateFields.order_status = "selesai";
    }

    await order.update(updateFields);

    res.status(200).json({
      message: `Status Order #${id} berhasil diubah menjadi ${updateFields.order_status}.`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: "Gagal memperbarui status order.",
      error: error.message,
    });
  }
};

// --- FUNGSI UPLOAD RESI (ADMIN) ---
exports.shipOrder = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin." });
  }

  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { shipping_receipt_number } = req.body;

    if (!shipping_receipt_number || shipping_receipt_number.trim() === "") {
      await t.rollback();
      return res.status(400).json({ message: "Nomor resi wajib diisi." });
    }

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order tidak ditemukan." });
    }

    if (order.order_status !== "diproses") {
      await t.rollback();
      return res.status(400).json({
        message: `Hanya pesanan berstatus 'diproses' yang dapat dikirim. Status saat ini: ${order.order_status}`,
      });
    }

    const receiptUrl = req.file
      ? `uploads/receipts/${req.file.filename}`
      : null;

    await order.update(
      {
        shipping_receipt_number: shipping_receipt_number,
        shipping_receipt_url: receiptUrl,
        order_status: "dikirim",
        shipped_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Resi berhasil diupload. Status order diubah menjadi 'dikirim'.",
      order: order,
    });
  } catch (error) {
    await t.rollback();
    console.error("Ship order error:", error);
    res.status(500).json({
      message: "Gagal mengupload resi.",
      error: error.message,
    });
  }
};

// FUNGSI EXPORT EXCEL (ADMIN)

exports.exportOrdersToExcel = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin." });
  }

  try {
    const { order_status, start_date, end_date } = req.query;

    let whereCondition = {};

    if (order_status) {
      whereCondition.order_status = order_status;
    }

    if (start_date && end_date) {
      whereCondition.created_at = {
        [Op.between]: [
          new Date(start_date),
          new Date(end_date + "T23:59:59Z"),
        ],
      };
    } else if (start_date) {
      whereCondition.created_at = { [Op.gte]: new Date(start_date) };
    } else if (end_date) {
      whereCondition.created_at = {
        [Op.lte]: new Date(end_date + "T23:59:59Z"),
      };
    }

    const orders = await Order.findAll({
      where: whereCondition,
      include: orderIncludeOptions(true),
      order: [["created_at", "ASC"]],
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada data order ditemukan untuk diekspor." });
    }

    let totalPendapatanBersih = 0;
    let totalPendapatanPending = 0;

    const pendingStatuses = [
      "menunggu pembayaran",
      "menunggu verifikasi",
      "diproses",
      "dikirim",
      "diterima",
    ];

    orders.forEach((order) => {
      const grandTotal = parseFloat(order.grand_total || 0);

      if (order.order_status === "selesai") {
        totalPendapatanBersih += grandTotal;
      } else if (pendingStatuses.includes(order.order_status)) {
        totalPendapatanPending += grandTotal;
      }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Admin E-commerce";
    workbook.lastModifiedBy = "Sistem E-commerce";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("Laporan Pesanan");

    worksheet.columns = [
      { header: "No.", key: "no", width: 5 },
      { header: "ID Pelanggan", key: "user_id", width: 15 },
      { header: "Nama Pelanggan", key: "user_name", width: 30 },
      { header: "Email Pelanggan", key: "user_email", width: 30 },
      { header: "Alamat Pengiriman", key: "shipping_address", width: 45 },
      {
        header: "Detail Item (Produk | Varian | Qty | Harga Satuan)",
        key: "items_detail",
        width: 70,
      },
      {
        header: "Subtotal",
        key: "subtotal",
        width: 17,
        style: { numFmt: '"Rp"#,##0.00' },
      },
      {
        header: "Ongkir",
        key: "shipping_cost",
        width: 17,
        style: { numFmt: '"Rp"#,##0.00' },
      },
      {
        header: "Total + Ongkir",
        key: "grand_total",
        width: 17,
        style: { numFmt: '"Rp"#,##0.00' },
      },
      { header: "Status Pembayaran", key: "payment_status", width: 20 },
      { header: "No. Resi", key: "shipping_receipt", width: 25 },
      { header: "Status Pesanan", key: "order_status", width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007BFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        bottom: { style: "thin" },
      };
    });

    orders.forEach((order, index) => {
      const itemsDetail = order.items
        .map((item) => {
          const variant = item.productVariant;
          const product = variant ? variant.product : null;
          const productName = product ? product.name : "Produk Dihapus";
          const variantInfo = [variant?.color, variant?.size]
            .filter(Boolean)
            .join(" ")
            .trim();

          return `${productName} | ${variantInfo || "N/A"} | ${
            item.quantity
          }x | Rp ${parseFloat(item.price).toLocaleString("id-ID")}`;
        })
        .join("\n");

      worksheet.addRow({
        no: index + 1,
        user_id: order.user ? order.user.id : "N/A",
        user_name: order.user
          ? `${order.user.first_name} ${order.user.last_name}`
          : "N/A",
        user_email: order.user ? order.user.email : "N/A",
        shipping_address: order.shipping_address,
        items_detail: itemsDetail,
        subtotal: parseFloat(order.total_price),
        shipping_cost: parseFloat(order.shipping_cost),
        grand_total: parseFloat(order.grand_total),
        payment_status: order.payment
          ? order.payment.payment_status
          : "Belum Bayar",
        shipping_receipt: order.shipping_receipt_number || "Belum ada",
        order_status: order.order_status,
      });
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell("shipping_address").alignment = {
          wrapText: true,
          vertical: "top",
        };
        row.getCell("items_detail").alignment = {
          wrapText: true,
          vertical: "top",
        };
        row.getCell("no").alignment = { vertical: "top" };
        row.getCell("user_id").alignment = { vertical: "top" };
      }
    });

    worksheet.addRow([]);

    const stylePendapatan = {
      font: { bold: true, size: 14, color: { argb: "FF008000" } },
    };
    const stylePendapatanPending = {
      font: { bold: true, size: 14, color: { argb: "FFFFA500" } },
    };
    const styleNominal = {
      numFmt: '"Rp"#,##0.00',
      font: { bold: true, size: 14 },
    };

    const rowPending = worksheet.addRow([
      "Total Pendapatan (Pending)",
      totalPendapatanPending,
    ]);
    rowPending.getCell(1).style = stylePendapatanPending;
    rowPending.getCell(2).style = {
      ...styleNominal,
      font: { ...styleNominal.font, color: { argb: "FFFFA500" } },
    };
    
    const rowBersih = worksheet.addRow([
      "Total Pendapatan Akhir (Selesai)",
      totalPendapatanBersih,
    ]);
    rowBersih.getCell(1).style = stylePendapatan;
    rowBersih.getCell(2).style = {
      ...styleNominal,
      font: { ...styleNominal.font, color: { argb: "FF008000" } },
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const timestamp = new Date().toISOString().replace(/:/g, "-").slice(0, 19);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Laporan_Pesanan_${timestamp}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error("Export orders error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Gagal mengekspor data order ke Excel.",
        error: error.message,
      });
    }
  }
};