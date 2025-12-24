@echo off
echo ================================================
echo Database Migration - Add Image Column
echo ================================================
echo.
echo This script will add the 'image' column to your products table.
echo.
echo Database: galondb
echo Host: localhost:3306
echo User: root
echo.
echo ================================================
echo.

mysql -u root -p galondb < migration_add_image.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo SUCCESS! Image column added to products table.
    echo ================================================
    echo.
    echo You can now restart your Go server and the
    echo /transactions endpoint should work correctly.
    echo.
) else (
    echo.
    echo ================================================
    echo ERROR! Migration failed.
    echo ================================================
    echo.
    echo Please run this SQL manually in MySQL:
    echo ALTER TABLE products ADD COLUMN image VARCHAR(255) NULL AFTER price;
    echo.
)

pause
