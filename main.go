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

	repo := &repositories.ProductRepository{DB: db}
	service := &services.ProductService{Repo: repo}
	controller := &controllers.ProductController{Service: service}

	app.Static("/upload", "./upload")
	routes.ProductRoutes(app, controller)

	app.Listen(":3000")
}
