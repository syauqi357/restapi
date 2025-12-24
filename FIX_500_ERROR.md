# Quick Fix for 500 Error on /transactions

## Problem

The `/transactions` endpoint is returning a 500 error because the database query is trying to SELECT the `image` column from the `products` table, but that column doesn't exist yet.

## Solution - Add the Image Column

You have **3 options** to fix this:

### Option 1: Using Laragon's MySQL (Recommended)

1. Open **HeidiSQL** (comes with Laragon)
2. Connect to your database
3. Select the `galondb` database
4. Click on **Query** tab
5. Paste this SQL:
   ```sql
   ALTER TABLE products ADD COLUMN image VARCHAR(255) NULL AFTER price;
   ```
6. Click **Execute** (or press F9)

### Option 2: Using Command Line

1. Open **Command Prompt** in the project folder
2. Run the migration script:
   ```bash
   run_migration.bat
   ```
3. Enter your MySQL password when prompted (usually empty for Laragon)

### Option 3: Manual MySQL Command

```bash
# Open MySQL CLI
mysql -u root -p galondb

# Run this command
ALTER TABLE products ADD COLUMN image VARCHAR(255) NULL AFTER price;

# Exit
exit;
```

## Verify the Fix

After adding the column, restart your Go server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
go run main.go
```

Now test:
1. Open your browser
2. Go to the Transactions tab
3. The 500 error should be gone!

## Why This Happened

The transaction repository now includes this query:
```sql
SELECT t.id, t.product_id, t.quantity, p.name, p.price, p.image
FROM transactions t
JOIN products p ON t.product_id = p.id
```

It's trying to get `p.image`, but your database table was created before we added image support, so the column doesn't exist yet.

## Next Steps

After the migration:
- ✅ Products can have images
- ✅ Transactions will show product images
- ✅ No more 500 errors!
