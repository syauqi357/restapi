-- Add image column to existing products table
ALTER TABLE products ADD COLUMN image VARCHAR(255) NULL AFTER price;
