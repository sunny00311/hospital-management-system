-- 014_delete_bill_items.sql
-- Delete all line items for a bill (used during bill re-edit before
-- finalization). Application-layer policy gates this.
-- params: [ bill_id ]

DELETE FROM `bill_items` WHERE `bill_id` = ?;