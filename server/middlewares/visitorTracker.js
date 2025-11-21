const db = require('../models');
const { Visitor } = db;

const trackVisitor = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    const today = new Date();
    
    await Visitor.findOrCreate({
      where: {
        ip_address: ip,
        visit_date: today
      },
      defaults: {
        ip_address: ip,
        visit_date: today
      }
    });

  } catch (error) {
    console.error("Visitor tracking error:", error.message);
  }
  
  next();
};

module.exports = trackVisitor;