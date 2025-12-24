package repositories

import (
	"database/sql"
	"galon/models"
)

type ProductRepository struct {
	DB *sql.DB
}

func (r *ProductRepository) GetAll() ([]models.Product, error) {
	rows, err := r.DB.Query("SELECT id, name, price, image FROM products ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Price, &p.Image)
		products = append(products, p)
	}
	return products, nil
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	var p models.Product
	err := r.DB.QueryRow(
		"SELECT id, name, price, image FROM products WHERE id = ?",
		id,
	).Scan(&p.ID, &p.Name, &p.Price, &p.Image)

	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepository) Create(p *models.Product) error {
	_, err := r.DB.Exec(
		"INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
		p.Name, p.Price, p.Image,
	)
	return err
}

func (r *ProductRepository) Update(id int, name string, price float64) error {
	_, err := r.DB.Exec(
		"UPDATE products SET name = ?, price = ? WHERE id = ?",
		name, price, id,
	)
	return err
}

func (r *ProductRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM products WHERE id = ?", id)
	return err
}
