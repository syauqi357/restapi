package repositories

import (
	"database/sql"
	"galon/models"
)

type ProductRepository struct {
	DB *sql.DB
}

func (r *ProductRepository) GetAll() ([]models.Product, error) {
	rows, err := r.DB.Query("SELECT id, name, price, COALESCE(image, '') as image, stock FROM products ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Price, &p.Image, &p.Stock)
		products = append(products, p)
	}
	return products, nil
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	var p models.Product
	err := r.DB.QueryRow(
		"SELECT id, name, price, COALESCE(image, '') as image, stock FROM products WHERE id = ?",
		id,
	).Scan(&p.ID, &p.Name, &p.Price, &p.Image, &p.Stock)

	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepository) Create(p *models.Product) error {
	_, err := r.DB.Exec(
		"INSERT INTO products (name, price, image, stock) VALUES (?, ?, ?, ?)",
		p.Name, p.Price, p.Image, p.Stock,
	)
	return err
}

func (r *ProductRepository) Update(id int, name string, price float64, image string, stock int) error {
	if image != "" {
		_, err := r.DB.Exec(
			"UPDATE products SET name = ?, price = ?, image = ?, stock = ? WHERE id = ?",
			name, price, image, stock, id,
		)
		return err
	}
	_, err := r.DB.Exec(
		"UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
		name, price, stock, id,
	)
	return err
}

func (r *ProductRepository) UpdateStock(id int, delta int) error {
	_, err := r.DB.Exec(
		"UPDATE products SET stock = stock + ? WHERE id = ?",
		delta, id,
	)
	return err
}

func (r *ProductRepository) GetStock(id int) (int, error) {
	var stock int
	err := r.DB.QueryRow("SELECT stock FROM products WHERE id = ?", id).Scan(&stock)
	return stock, err
}

func (r *ProductRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM products WHERE id = ?", id)
	return err
}
