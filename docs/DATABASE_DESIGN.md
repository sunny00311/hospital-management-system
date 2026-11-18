# Database design and ER diagram

## Design goals

- Normalize transactional entities to Third Normal Form (3NF), where practical.
- Use primary keys, foreign keys, unique constraints, and InnoDB.
- Resolve many-to-many relationships with junction tables.
- Preserve historical prices in bill line items.
- Index foreign keys and common filter columns.

## Entities

| Entity | Purpose | Relationship |
|---|---|---|
| departments | Department master | 1:M doctors |
| doctors | Doctor master | Belongs to one department |
| patients | Patient master | 1:M appointments and bills |
| appointments | Patient-doctor booking | Belongs to patient and doctor |
| medical_records | Visit diagnosis/treatment | Optional 1:1 with appointment |
| prescriptions | Prescription header | Belongs to medical record |
| medicines | Medicine catalogue and stock | Used by prescription items |
| prescription_items | Prescription medicine lines | Resolves prescription/medicine M:N |
| bills | Bill header | Belongs to patient; may reference appointment |
| bill_items | Bill line items | Belongs to one bill |
| payments | Payment transactions | Bill has 0:M payments |

## Mermaid ER diagram

~~~mermaid
erDiagram
    DEPARTMENTS ||--o{ DOCTORS : has
    PATIENTS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : attends
    APPOINTMENTS ||--o| MEDICAL_RECORDS : generates
    MEDICAL_RECORDS ||--o{ PRESCRIPTIONS : has
    PRESCRIPTIONS ||--|{ PRESCRIPTION_ITEMS : contains
    MEDICINES ||--o{ PRESCRIPTION_ITEMS : appears_in
    PATIENTS ||--o{ BILLS : receives
    APPOINTMENTS ||--o| BILLS : may_generate
    BILLS ||--|{ BILL_ITEMS : contains
    BILLS ||--o{ PAYMENTS : receives

    DEPARTMENTS {
      int department_id PK
      varchar department_name UK
    }
    DOCTORS {
      int doctor_id PK
      int department_id FK
      varchar full_name
      varchar specialization
      decimal consultation_fee
    }
    PATIENTS {
      int patient_id PK
      varchar full_name
      varchar phone UK
      varchar email UK
      date date_of_birth
    }
    APPOINTMENTS {
      int appointment_id PK
      int patient_id FK
      int doctor_id FK
      datetime appointment_at
      varchar status
    }
    MEDICAL_RECORDS {
      int record_id PK
      int appointment_id FK,UK
      text diagnosis
      text treatment
    }
    PRESCRIPTIONS {
      int prescription_id PK
      int record_id FK
    }
    MEDICINES {
      int medicine_id PK
      varchar medicine_name
      decimal unit_price
      int stock_quantity
    }
    PRESCRIPTION_ITEMS {
      int prescription_item_id PK
      int prescription_id FK
      int medicine_id FK
      int quantity
    }
    BILLS {
      int bill_id PK
      int patient_id FK
      int appointment_id FK,UK
      varchar status
    }
    BILL_ITEMS {
      int bill_item_id PK
      int bill_id FK
      varchar description
      int quantity
      decimal unit_price
    }
    PAYMENTS {
      int payment_id PK
      int bill_id FK
      decimal amount
      varchar payment_method
    }
~~~

## Cardinality rules

- Department to doctor: 1:M.
- Patient to appointment: 1:M.
- Doctor to appointment: 1:M.
- Appointment to medical record: 1:0..1.
- Medical record to prescription: 1:M.
- Prescription to medicine: M:N through prescription_items.
- Patient to bill: 1:M.
- Appointment to bill: 1:0..1 if one bill per appointment is enforced.
- Bill to bill item: 1:M.
- Bill to payment: 1:M for partial payments.

## Normalization

**1NF:** Every field is atomic. Medicine lists are not stored as comma-separated values.

**2NF:** Non-key attributes depend on the complete candidate key. Dosage, frequency, duration, and quantity describe a prescription-medicine line and belong in prescription_items.

**3NF:** Non-key attributes depend on the key, the whole key, and nothing but the key. Department names live in departments, patient details live in patients, and appointment rows store foreign keys rather than duplicating master data.

**Historical price:** bill_items.unit_price is a transaction snapshot. It records the amount charged at billing time and must not change when catalogue prices change.

## Integrity notes

Use RESTRICT for deleting referenced clinical and financial history. CHECK constraints require MySQL 8.0.16+ for enforcement. A unique doctor/time key prevents identical appointment start times but not overlapping intervals; duration-aware scheduling needs transactional validation. Medicine dispensing must validate stock and decrement it in a transaction using SELECT ... FOR UPDATE. Keep this ERD synchronized with the physical SQL schema.
