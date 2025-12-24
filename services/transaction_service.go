package services

import (
	"errors"
	"galon/repositories"
)

var (
	ErrInvalidProduct    = errors.New("invalid product ID")
	ErrInvalidQuantity   = errors.New("invalid quantity")
	ErrInsufficientStock = errors.New("insufficient stock")
)

type TransactionService struct {
	Repo        *repositories.TransactionRepository
	ProductRepo *repositories.ProductRepository
}

func (s *TransactionService) GetAll() (interface{}, error) {
	return s.Repo.GetAll()
}

func (s *TransactionService) GetByID(id int) (interface{}, error) {
	return s.Repo.GetByID(id)
}

func (s *TransactionService) Create(productID, quantity int) error {
	if productID <= 0 {
		return ErrInvalidProduct
	}
	if quantity <= 0 {
		return ErrInvalidQuantity
	}

	// Check stock availability
	stock, err := s.ProductRepo.GetStock(productID)
	if err != nil {
		return ErrInvalidProduct
	}

	if stock < quantity {
		return ErrInsufficientStock
	}

	// Create transaction
	if err := s.Repo.Create(productID, quantity); err != nil {
		return err
	}

	// Reduce stock
	return s.ProductRepo.UpdateStock(productID, -quantity)
}

func (s *TransactionService) Update(id, productID, quantity int) error {
	if productID <= 0 {
		return ErrInvalidProduct
	}
	if quantity <= 0 {
		return ErrInvalidQuantity
	}
	return s.Repo.Update(id, productID, quantity)
}

func (s *TransactionService) Delete(id int) error {
	return s.Repo.Delete(id)
}
