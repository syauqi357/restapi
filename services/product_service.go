package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"galon/models"
	"galon/repositories"
)

type ProductService struct {
	Repo *repositories.ProductRepository
}

func (s *ProductService) Create(name string, price float64, file *multipart.FileHeader, stock int) (string, error) {
	if name == "" || price <= 0 {
		return "", errors.New("invalid input")
	}

	filename := ""
	if file != nil {
		ext := filepath.Ext(file.Filename)
		filename = fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	}

	product := &models.Product{
		Name:  name,
		Price: price,
		Image: filename,
		Stock: stock,
	}

	return filename, s.Repo.Create(product)
}

func (s *ProductService) Update(id int, name string, price float64, file *multipart.FileHeader, stock int) (string, error) {
	if name == "" || price <= 0 {
		return "", errors.New("invalid input")
	}

	filename := ""
	if file != nil {
		ext := filepath.Ext(file.Filename)
		filename = fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	}

	return filename, s.Repo.Update(id, name, price, filename, stock)
}

func (s *ProductService) UpdateStock(id int, delta int) error {
	// Check current stock to prevent negative values
	currentStock, err := s.Repo.GetStock(id)
	if err != nil {
		return err
	}

	if currentStock+delta < 0 {
		return errors.New("insufficient stock")
	}

	return s.Repo.UpdateStock(id, delta)
}
