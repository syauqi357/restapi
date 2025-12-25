package main

import (
	"galon/config"
	"galon/controllers"
	"galon/repositories"
	"galon/routes"
	"galon/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	db := config.ConnectDB()

	// Product Setup
	productRepo := &repositories.ProductRepository{DB: db}
	productService := &services.ProductService{Repo: productRepo}
	productController := &controllers.ProductController{Service: productService}

	// Transaction Setup
	transactionRepo := &repositories.TransactionRepository{DB: db}
	transactionService := &services.TransactionService{
		Repo:        transactionRepo,
		ProductRepo: productRepo,
	}
	transactionController := &controllers.TransactionController{Service: transactionService}

	app.Static("/uploads", "./uploads")
	routes.ProductRoutes(app, productController)
	routes.RegisterTransactionRoutes(app, transactionController)

	app.Listen(":3000")
}
