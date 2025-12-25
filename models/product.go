package models

// Product represents the product model.
type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Image string  `json:"image"`
	Stock int     `json:"stock"`
}
