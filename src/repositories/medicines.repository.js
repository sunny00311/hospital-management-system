'use strict';

/**
 * src/repositories/medicines.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listMedicines(q, category, limit, offset) {
  const [rows] = await execute(pool, 'billing/016_list_medicines.sql', [
    q, q, q, category, category, limit, offset,
  ]);
  return rows;
}

async function showMedicine(medicineId) {
  const [rows] = await execute(pool, 'billing/017_show_medicine.sql', [medicineId]);
  return rows[0] || null;
}

async function createMedicine(data) {
  const [result] = await execute(pool, 'billing/018_create_medicine.sql', [
    data.medicine_name, data.generic_name, data.category, data.unit_price,
    data.stock_quantity, data.reorder_level, data.unit, data.is_active,
  ]);
  return result.insertId;
}

async function updateMedicine(medicineId, data) {
  await execute(pool, 'billing/019_update_medicine.sql', [
    data.medicine_name, data.generic_name, data.category, data.unit_price,
    data.reorder_level, data.unit, data.is_active, medicineId,
  ]);
}

async function adjustStock(data) {
  await execute(pool, 'billing/023_adjust_stock.sql', [
    data.medicine_id, data.movement_type, data.quantity_delta,
    data.reference_type, data.reference_id, data.note, data.moved_by,
  ]);
}

async function countMedicines(q, category) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM medicines
     WHERE (? IS NULL
            OR medicine_name LIKE CONCAT('%', ?, '%')
            OR generic_name LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR category = ?)`,
    [q, q, q, category, category]
  );
  return Number(rows[0].c);
}

async function showStockMovements(medicineId, limit, offset) {
  const [rows] = await execute(pool, 'billing/046_show_stock_movements.sql', [
    medicineId, limit, offset,
  ]);
  return rows;
}

module.exports = {
  listMedicines, showMedicine, createMedicine, updateMedicine,
  adjustStock, countMedicines, showStockMovements,
};