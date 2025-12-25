package models

// Transaction represents the transaction model.
type Transaction struct {
	ID           int     `json:"id"`
	ProductID    int     `json:"product_id"`
	Quantity     int     `json:"quantity"`
	ProductName  string  `json:"product_name"`
	ProductPrice float64 `json:"product_price"`
	ProductImage string  `json:"product_image"`
}
