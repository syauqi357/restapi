package models

type Transaction struct {
	ID        int `json:"id"`
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}
