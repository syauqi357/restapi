package repositories

import (
	"database/sql"
	"galon/models"
)

type TransactionRepository struct {
	DB *sql.DB
}

func (r *TransactionRepository) GetAll() ([]models.Transaction, error) {
	rows, err := r.DB.Query("SELECT id, product_id, quantity FROM transactions ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Transaction
	for rows.Next() {
		var t models.Transaction
		if err := rows.Scan(&t.ID, &t.ProductID, &t.Quantity); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, nil
}

func (r *TransactionRepository) Create(productID, quantity int) error {
	_, err := r.DB.Exec(
		"INSERT INTO transactions (product_id, quantity) VALUES (?, ?)",
		productID, quantity,
	)
	return err
}
