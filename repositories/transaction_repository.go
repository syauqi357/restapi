package repositories

import (
	"database/sql"
	"galon/models"
)

type TransactionRepository struct {
	DB *sql.DB
}

func (r *TransactionRepository) GetAll() ([]models.Transaction, error) {
	query := `
		SELECT t.id, t.product_id, t.quantity, p.name, p.price, COALESCE(p.image, '') as image
		FROM transactions t
		JOIN products p ON t.product_id = p.id
		ORDER BY t.id DESC
	`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Transaction
	for rows.Next() {
		var t models.Transaction
		if err := rows.Scan(&t.ID, &t.ProductID, &t.Quantity, &t.ProductName, &t.ProductPrice, &t.ProductImage); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, nil
}

func (r *TransactionRepository) GetByID(id int) (*models.Transaction, error) {
	query := `
		SELECT t.id, t.product_id, t.quantity, p.name, p.price, COALESCE(p.image, '') as image
		FROM transactions t
		JOIN products p ON t.product_id = p.id
		WHERE t.id = ?
	`
	var t models.Transaction
	err := r.DB.QueryRow(query, id).Scan(&t.ID, &t.ProductID, &t.Quantity, &t.ProductName, &t.ProductPrice, &t.ProductImage)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TransactionRepository) Create(productID, quantity int) error {
	_, err := r.DB.Exec(
		"INSERT INTO transactions (product_id, quantity) VALUES (?, ?)",
		productID, quantity,
	)
	return err
}

func (r *TransactionRepository) Update(id, productID, quantity int) error {
	_, err := r.DB.Exec(
		"UPDATE transactions SET product_id = ?, quantity = ? WHERE id = ?",
		productID, quantity, id,
	)
	return err
}

func (r *TransactionRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM transactions WHERE id = ?", id)
	return err
}
