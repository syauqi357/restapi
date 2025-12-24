package routes

import (
	"galon/controllers"

	"github.com/gofiber/fiber/v2"
)

func ProductRoutes(app *fiber.App, controller *controllers.ProductController) {
	app.Get("/products", controller.GetAll)
	app.Get("/products/:id", controller.GetByID)
	app.Post("/products", controller.Create)
	app.Put("/products/:id", controller.Update)
	app.Patch("/products/:id/stock", controller.UpdateStock)
	app.Delete("/products/:id", controller.Delete)
}

func RegisterTransactionRoutes(app *fiber.App, c *controllers.TransactionController) {
	app.Get("/transactions", c.GetAll)
	app.Get("/transactions/:id", c.GetByID)
	app.Post("/transactions", c.Create)
	app.Put("/transactions/:id", c.Update)
	app.Delete("/transactions/:id", c.Delete)
}
