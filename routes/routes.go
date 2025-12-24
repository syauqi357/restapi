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
	app.Delete("/products/:id", controller.Delete)
}
