'use strict';

/**
 * src/services/medicines.service.js
 */

const {
  ValidationError, requireStr, requireDecimal, optionalStr, requireInt,
  optionalEmail, requireEnum, requirePositiveInt,
} = require('../utils/validators');
const { NotFoundError } = require('../utils/errors');
const medicinesRepo = require('../repositories/medicines.repository');

const UNITS = ['tablet', 'capsule', 'bottle', 'inhaler', 'sachet', 'injection', 'syrup', 'cream', 'ointment', 'drops'];

function validateMedicine(data) {
  const medicine_name = requireStr(data.medicine_name, 'medicine_name', 150);
  const generic_name = optionalStr(data.generic_name, 'generic_name', 150);
  const category = optionalStr(data.category, 'category', 100);
  const unit_price = requireDecimal(data.unit_price, 'unit_price');
  const stock_quantity = requireInt(data.stock_quantity, 'stock_quantity');
  const reorder_level = requireInt(data.reorder_level, 'reorder_level');
  const unit = requireEnum((data.unit || 'tablet').trim(), UNITS, 'unit');
  const is_active = data.is_active === undefined ? 1 : (data.is_active === true || data.is_active === 'true' || data.is_active === 1 || data.is_active === '1' ? 1 : 0);
  if (unit_price < 0) throw new ValidationError('Unit price cannot be negative.', 'unit_price');
  if (stock_quantity < 0) throw new ValidationError('Stock quantity cannot be negative.', 'stock_quantity');
  if (reorder_level < 0) throw new ValidationError('Reorder level cannot be negative.', 'reorder_level');
  return { medicine_name, generic_name, category, unit_price, stock_quantity, reorder_level, unit, is_active };
}

async function listMedicines(q, category, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    medicinesRepo.listMedicines(q, category, limit, offset),
    medicinesRepo.countMedicines(q, category),
  ]);
  return { rows, count, page, limit };
}

async function showMedicine(medicineId) {
  const medicine = await medicinesRepo.showMedicine(medicineId);
  if (!medicine) throw new NotFoundError('Medicine not found.');
  return medicine;
}

async function createMedicine(data) {
  const validated = validateMedicine(data);
  return medicinesRepo.createMedicine(validated);
}

async function updateMedicine(medicineId, data) {
  const validated = validateMedicine(data);
  await medicinesRepo.updateMedicine(medicineId, validated);
}

async function adjustStock(medicineId, data, movedBy) {
  const medicine = await medicinesRepo.showMedicine(medicineId);
  if (!medicine) throw new NotFoundError('Medicine not found.');
  const movement_type = requireEnum(data.movement_type, ['Purchase','Dispense','Adjustment','Return'], 'movement_type');
  const quantity_delta = Number(data.quantity_delta);
  if (!Number.isInteger(quantity_delta) || quantity_delta === 0) {
    throw new ValidationError('Quantity delta must be a non-zero integer.', 'quantity_delta');
  }
  // Prevent negative stock for dispense/adjustment.
  if ((movement_type === 'Dispense' || movement_type === 'Adjustment') && quantity_delta < 0) {
    const projected = medicine.stock_quantity + quantity_delta;
    if (projected < 0) {
      throw new ValidationError('Stock cannot go below zero.');
    }
  }
  await medicinesRepo.adjustStock({
    medicine_id: medicineId,
    movement_type,
    quantity_delta,
    reference_type: data.reference_type || null,
    reference_id: data.reference_id || null,
    note: data.note || null,
    moved_by: movedBy,
  });
}

async function showStockMovements(medicineId, page, limit) {
  const medicine = await medicinesRepo.showMedicine(medicineId);
  if (!medicine) throw new NotFoundError('Medicine not found.');
  const offset = (page - 1) * limit;
  const rows = await medicinesRepo.showStockMovements(medicineId, limit, offset);
  return { rows, medicine };
}

module.exports = {
  listMedicines, showMedicine, createMedicine, updateMedicine,
  adjustStock, showStockMovements, validateMedicine,
};