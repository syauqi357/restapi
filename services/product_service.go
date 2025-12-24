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

func (s *ProductService) Create(name string, price float64, file *multipart.FileHeader) error {
	if name == "" || price <= 0 {
		return errors.New("invalid input")
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
	}

	return s.Repo.Create(product)
}
