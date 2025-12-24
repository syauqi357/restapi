# Image Upload Fix - Setup Guide

## Issues Fixed

1. ✅ **Missing Upload Directory** - Created `upload/` folder
2. ✅ **Filename Mismatch** - Controller now uses generated unique filenames from service
3. ✅ **Missing Image Column** - Updated SQL schema to include `image` field
4. ✅ **Update Function** - Added image support to product update functionality
5. ✅ **CORS Issues** - Added CORS middleware for frontend communication
6. ✅ **Transaction Images** - Transactions now include product images via JOIN query

## Setup Instructions

### 1. Database Migration

If you already have a `products` table, run this migration:

```sql
-- Run this in your MySQL database
ALTER TABLE products ADD COLUMN image VARCHAR(255) NULL AFTER price;
```

Or drop and recreate using the updated schema in `galondb.sql`.

### 2. Install Dependencies

```bash
go mod tidy
```

### 3. Start the Server

```bash
go run main.go
```

The server will run on `http://localhost:3000`

### 4. Open the Frontend

Open `index.html` in your browser or serve it via Laragon.

## How It Works

### Image Upload Flow

1. **Frontend**: User selects an image file
2. **Preview**: JavaScript shows preview using FileReader
3. **Submit**: FormData sends file to backend
4. **Backend**: 
   - Service generates unique filename (timestamp + extension)
   - Controller saves file to `./upload/` directory
   - Repository stores filename in database
5. **Display**: Images are served from `/upload/` static route

### File Structure

```
upload/                    # Image storage (created)
├── 1735074123456789.jpg  # Unique timestamped filenames
└── 1735074234567890.png

controllers/
├── product_controller.go  # Handles file upload
└── transaction_controller.go

services/
└── product_service.go     # Generates unique filenames

repositories/
├── product_repository.go  # Stores image path
└── transaction_repository.go  # Joins with products for images

models/
├── product.go            # Image field
└── transaction.go        # Product details fields
```

## Testing

1. **Add Product with Image**:
   - Go to Products tab
   - Fill in name and price
   - Select an image file
   - Click "Add Product"
   - Image preview should appear
   - Product should show in table with thumbnail

2. **Edit Product**:
   - Click "Edit" on a product
   - Form should populate with existing data
   - Image preview should show current image
   - Change image or keep existing
   - Click "Update Product"

3. **View in Transactions**:
   - Go to Transactions tab
   - Create a transaction with a product that has an image
   - Product image should appear in transactions table

## Troubleshooting

### Images Not Showing

1. Check if `upload/` directory exists
2. Verify database has `image` column
3. Check browser console for 404 errors
4. Ensure Go server is running on port 3000

### CORS Errors

- CORS middleware is now enabled in `main.go`
- Allows all origins for development

### Database Errors

- Run the migration script: `migration_add_image.sql`
- Or recreate database using updated `galondb.sql`
