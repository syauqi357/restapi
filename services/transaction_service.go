package services

import (
	"errors"
	"galon/repositories"
)

var (
	ErrInvalidProduct  = errors.New("invalid product ID")
	ErrInvalidQuantity = errors.New("invalid quantity")
)

type TransactionService struct {
	Repo *repositories.TransactionRepository
}

func (s *TransactionService) GetAll() (interface{}, error) {
	return s.Repo.GetAll()
}

func (s *TransactionService) Create(productID, quantity int) error {
	if productID <= 0 {
		return ErrInvalidProduct
	}
	if quantity <= 0 {
		return ErrInvalidQuantity
	}
	return s.Repo.Create(productID, quantity)
}
