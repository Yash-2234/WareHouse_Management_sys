const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const RFIDTag = require('../models/RFIDTag');
const RFIDScan = require('../models/RFIDScan');
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const ProductMovement = require('../models/ProductMovement');
const { Warehouse, Location, ActivityLog } = require('../models/Warehouse');

dotenv.config({ path: __dirname + '/../.env' });

const seedSystem = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database records...');
    await User.deleteMany();
    await Product.deleteMany();
    await RFIDTag.deleteMany();
    await RFIDScan.deleteMany();
    await Inventory.deleteMany();
    await InventoryTransaction.deleteMany();
    await ProductMovement.deleteMany();
    await Warehouse.deleteMany();
    await Location.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Seeding Warehouses & Locations...');
    const whAlpha = await Warehouse.create({
      name: 'Warehouse Alpha',
      code: 'WHS-ALP',
      address: 'Industrial Park Zone 4, Bay 12',
      capacity: 15000,
      currentStockCount: 4500,
      status: 'Active'
    });

    const whBravo = await Warehouse.create({
      name: 'Warehouse Bravo',
      code: 'WHS-BRV',
      address: 'Logistics Hub North, Gate 3',
      capacity: 10000,
      currentStockCount: 2800,
      status: 'Active'
    });

    console.log('Seeding Users (Admin, Manager, Operator)...');
    const adminUser = await User.create({
      name: 'Aarav Sharma',
      email: 'admin@warehouse.com',
      password: 'admin123',
      role: 'Admin',
      department: 'Executive Operations',
      status: 'Active'
    });

    const managerUser = await User.create({
      name: 'Priya Patel',
      email: 'manager@warehouse.com',
      password: 'manager123',
      role: 'Warehouse Manager',
      department: 'Inventory Management',
      status: 'Active'
    });

    const operatorUser = await User.create({
      name: 'Rohan Gupta',
      email: 'operator@warehouse.com',
      password: 'operator123',
      role: 'Warehouse Operator',
      department: 'RFID Scanning & Dock Ops',
      status: 'Active'
    });

    console.log('Seeding 20 Products & 20 RFID Tags...');

    const productsData = [
      { name: 'Industrial Roller Bearing 6205', category: 'Industrial Bearings', sku: 'SKU-BRG-1001', qty: 450, min: 50, loc: 'Rack A-01', wh: 'Warehouse Alpha', unit: 'Pcs' },
      { name: 'Tapered Roller Bearing 32210', category: 'Industrial Bearings', sku: 'SKU-BRG-1002', qty: 120, min: 30, loc: 'Rack A-02', wh: 'Warehouse Alpha', unit: 'Pcs' },
      { name: 'Precision Ball Bearing 6008-2RS', category: 'Industrial Bearings', sku: 'SKU-BRG-1003', qty: 8, min: 25, loc: 'Rack A-03', wh: 'Warehouse Alpha', unit: 'Pcs' }, // Low Stock
      { name: 'Heavy Duty Structural Steel I-Beam 6m', category: 'Steel Components', sku: 'SKU-STL-2001', qty: 75, min: 20, loc: 'Yard B-01', wh: 'Warehouse Bravo', unit: 'Length' },
      { name: 'Stainless Steel Plate 10mm x 2m x 1m', category: 'Steel Components', sku: 'SKU-STL-2002', qty: 40, min: 15, loc: 'Yard B-02', wh: 'Warehouse Bravo', unit: 'Sheets' },
      { name: 'Seamless Carbon Steel Pipe 4-Inch', category: 'Steel Components', sku: 'SKU-STL-2003', qty: 300, min: 50, loc: 'Yard B-03', wh: 'Warehouse Bravo', unit: 'Meters' },
      { name: 'Three-Phase AC Induction Motor 15kW', category: 'Electrical Motors', sku: 'SKU-MTR-3001', qty: 18, min: 5, loc: 'Rack C-01', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Brushless Servo Motor 750W 3000RPM', category: 'Electrical Motors', sku: 'SKU-MTR-3002', qty: 35, min: 10, loc: 'Rack C-02', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Explosion-Proof Electric Motor 45kW', category: 'Electrical Motors', sku: 'SKU-MTR-3003', qty: 4, min: 5, loc: 'Rack C-03', wh: 'Warehouse Alpha', unit: 'Units' }, // Low Stock
      { name: 'High-Pressure Hydraulic Gear Pump 250bar', category: 'Hydraulic Pumps', sku: 'SKU-PMP-4001', qty: 24, min: 8, loc: 'Rack D-01', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Variable Displacement Piston Pump 45cc', category: 'Hydraulic Pumps', sku: 'SKU-PMP-4002', qty: 14, min: 6, loc: 'Rack D-02', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Hydraulic Directional Control Valve 4-Way', category: 'Hydraulic Pumps', sku: 'SKU-PMP-4003', qty: 85, min: 20, loc: 'Rack D-03', wh: 'Warehouse Alpha', unit: 'Pcs' },
      { name: 'Industrial Hard Hat V-Gard Helmet', category: 'Safety Equipment', sku: 'SKU-SAF-5001', qty: 250, min: 40, loc: 'Bin S-01', wh: 'Warehouse Alpha', unit: 'Boxes' },
      { name: 'Heavy Duty Kevlar Cut-Resistant Gloves', category: 'Safety Equipment', sku: 'SKU-SAF-5002', qty: 500, min: 100, loc: 'Bin S-02', wh: 'Warehouse Alpha', unit: 'Pairs' },
      { name: 'Full Body Safety Harness w/ Lanyard', category: 'Safety Equipment', sku: 'SKU-SAF-5003', qty: 65, min: 15, loc: 'Bin S-03', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Heavy-Duty Wooden Euro Pallet 1200x800', category: 'Packaging Materials', sku: 'SKU-PKG-6001', qty: 850, min: 150, loc: 'Bay P-01', wh: 'Warehouse Bravo', unit: 'Pallets' },
      { name: 'Industrial Stretch Wrap Film 500mm', category: 'Packaging Materials', sku: 'SKU-PKG-6002', qty: 180, min: 30, loc: 'Bay P-02', wh: 'Warehouse Bravo', unit: 'Rolls' },
      { name: 'CNC Carboloy Carbide Milling Inserts', category: 'Machine Parts', sku: 'SKU-MAC-7001', qty: 1200, min: 200, loc: 'Drawer M-01', wh: 'Warehouse Alpha', unit: 'Pcs' },
      { name: 'Pneumatic Cylinder Double Acting 50mm', category: 'Machine Parts', sku: 'SKU-MAC-7002', qty: 42, min: 12, loc: 'Drawer M-02', wh: 'Warehouse Alpha', unit: 'Units' },
      { name: 'Grade 8.8 Hex Bolts & Nuts M16x60mm', category: 'Fasteners & Hardware', sku: 'SKU-FST-8001', qty: 5000, min: 1000, loc: 'Bin H-01', wh: 'Warehouse Alpha', unit: 'Sets' }
    ];

    for (let i = 0; i < productsData.length; i++) {
      const pData = productsData[i];
      const epc = `E2000017221101441890${(1000 + i).toString()}`;
      const tagId = `TAG-${(800000 + i).toString()}`;
      const prodId = `PRD-${(500000 + i).toString()}`;

      // 1. Create Tag
      const rfidTag = await RFIDTag.create({
        tagId,
        epc,
        pattern: 'GEN2v2-STANDARD-EPC',
        warehouseLocation: `${pData.wh} / ${pData.loc}`,
        status: 'Active'
      });

      // 2. Create Product with RFID tag assigned
      const product = await Product.create({
        productId: prodId,
        productName: pData.name,
        sku: pData.sku,
        category: pData.category,
        description: `High performance enterprise industrial ${pData.name.toLowerCase()} specification.`,
        quantity: pData.qty,
        minStock: pData.min,
        unit: pData.unit,
        location: pData.loc,
        warehouse: pData.wh,
        rfidTag: rfidTag._id
      });

      // Update Tag with Product reference
      rfidTag.product = product._id;
      await rfidTag.save();

      // Create Inventory entry
      await Inventory.create({
        product: product._id,
        quantity: product.quantity,
        minStock: product.minStock,
        location: product.location,
        warehouse: product.warehouse
      });

      // Create sample initial stock-in transaction
      await InventoryTransaction.create({
        transactionId: `IN-INIT-${i + 100}`,
        product: product._id,
        rfid: epc,
        type: 'STOCK_IN',
        quantity: pData.qty,
        previousQuantity: 0,
        newQuantity: pData.qty,
        user: managerUser._id,
        location: pData.loc,
        remarks: 'Initial catalog inventory initialization'
      });

      // Create sample RFID scan log
      await RFIDScan.create({
        rfidTag: rfidTag._id,
        scannedValue: epc,
        matchedProduct: product._id,
        confidence: 98.5,
        readerId: 'GATE-DOCK-READER-01',
        location: `${pData.wh} Checkpoint`,
        status: 'MATCHED',
        timestamp: new Date(Date.now() - (i * 3600000 * 2))
      });

      // Create movement history for 5 items
      if (i < 5) {
        await ProductMovement.create({
          product: product._id,
          rfidTag: epc,
          fromLocation: 'Inbound Dock A',
          toLocation: pData.loc,
          quantity: Math.floor(pData.qty / 2),
          movementType: 'Internal Transfer',
          user: operatorUser._id,
          pathHistory: ['Inbound Gate 01', 'Staging Zone B', pData.loc]
        });
      }
    }

    console.log('Seeding Activity Audit Logs...');
    await ActivityLog.create({
      user: adminUser.name,
      action: 'SYSTEM_BOOT',
      module: 'Core System',
      description: 'System database initialized and seeded with 20 industrial products & 20 active RFID tags.'
    });

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log(' DEMO CREDENTIALS:');
    console.log(' Admin:     admin@warehouse.com / admin123');
    console.log(' Manager:   manager@warehouse.com / manager123');
    console.log(' Operator:  operator@warehouse.com / operator123');
    console.log('====================================================');

  } catch (err) {
    console.error('Error during seeding:', err);
  }
};

if (require.main === module) {
  seedSystem().then(() => process.exit(0));
}

module.exports = seedSystem;
