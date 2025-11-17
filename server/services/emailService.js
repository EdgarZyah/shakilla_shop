const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER, // no-reply@shakillashop.site
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Mengirim email notifikasi ke Admin saat user upload bukti bayar.
 * @param {object} order - Objek order yang terkait (harus include User)
 * @param {object} payment - Objek payment yang baru di-update
 */
const sendAdminPaymentNotificationEmail = async (order, payment) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error(
      "ADMIN_EMAIL tidak diatur di .env. Notifikasi gagal dikirim."
    );
    return;
  }

  const user = order.user; 
  if (!user) {
    console.error(`Email notifikasi admin gagal: Data user tidak ditemukan untuk order #${order.id}`);
    return;
  }

  const mailOptions = {
    from: `"Notifikasi Shakilla Shop" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[Verifikasi Pembayaran] Pesanan Baru #${order.id}`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #fffafafa; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #f2c8c8;">
        
        <h3 style="color: #4A0000; font-size: 24px; margin-top: 0;">Halo Admin,</h3>
        <p style="color: #333333;">Ada pembayaran baru yang perlu diverifikasi untuk pesanan <strong>#${order.id}</strong>.</p>
        
        <h4 style="color: #4A0000; border-bottom: 2px solid #f7d9d9; padding-bottom: 5px;">Detail Pesanan:</h4>
        <ul style="list-style-type: none; padding: 0; color: #333333;">
          <li>ID Pesanan: <strong>#${order.id}</strong></li>
          <li>Nama Pelanggan: ${user.first_name || ""} ${user.last_name || ""}</li>
          <li>Email Pelanggan: ${user.email}</li>
          <li>Total Tagihan: <strong>Rp ${parseFloat(
            order.grand_total
          ).toLocaleString("id-ID")}</strong></li>
        </ul>

        <h4 style="color: #4A0000; border-bottom: 2px solid #f7d9d9; padding-bottom: 5px;">Detail Pembayaran:</h4>
        <ul style="list-style-type: none; padding: 0; color: #333333;">
          <li>Status Pembayaran: <strong>${payment.payment_status}</strong></li>
        </ul>
      </div>
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Email notifikasi admin terkirim ke ${adminEmail} for order #${order.id}`
    );
  } catch (error) {
    console.error(`Error mengirim email notifikasi admin:`, error);
  }
};

module.exports = {
  sendAdminPaymentNotificationEmail,
};