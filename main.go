package main

import (
	"galon/config"
	"galon/controllers"
	"galon/repositories"
	"galon/routes"
	"galon/services"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	db := config.ConnectDB()

	// Product Setup
	productRepo := &repositories.ProductRepository{DB: db}
	productService := &services.ProductService{Repo: productRepo}
	productController := &controllers.ProductController{Service: productService}

	// Transaction Setup
	transactionRepo := &repositories.TransactionRepository{DB: db}
	transactionService := &services.TransactionService{Repo: transactionRepo}
	transactionController := &controllers.TransactionController{Service: transactionService}

	app.Static("/upload", "./upload")
	routes.ProductRoutes(app, productController)
	routes.RegisterTransactionRoutes(app, transactionController)

	app.Listen(":3000")
}
