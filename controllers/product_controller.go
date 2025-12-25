package controllers

import (
	"galon/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ProductController handles product-related HTTP requests.
type ProductController struct {
	Service *services.ProductService
}

// getAll retrieves all products.
func (c *ProductController) GetAll(ctx *fiber.Ctx) error {
	products, err := c.Service.Repo.GetAll()
	if err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(products)
}

// GetByID retrieves a product by its ID.
func (c *ProductController) GetByID(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
	product, err := c.Service.Repo.GetByID(id)
	if err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "product not found"})
	}
	return ctx.JSON(product)
}

// function to create a new product
func (c *ProductController) Create(ctx *fiber.Ctx) error {
	name := ctx.FormValue("name")
	price, _ := strconv.ParseFloat(ctx.FormValue("price"), 64)
	stock, _ := strconv.Atoi(ctx.FormValue("stock"))

	// image uploads
	file, _ := ctx.FormFile("image")

	filename, err := c.Service.Create(name, price, file, stock)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// save file to uploads directory
	if file != nil && filename != "" {
		err := ctx.SaveFile(file, "./uploads/"+filename)
		if err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	// successful response
	return ctx.JSON(fiber.Map{"message": "produk berhasil dibuat"})
}

// function to update a product
func (c *ProductController) Update(ctx *fiber.Ctx) error {
	// get product id from url params string convert to int
	id, _ := strconv.Atoi(ctx.Params("id"))

	name := ctx.FormValue("name")
	price, _ := strconv.ParseFloat(ctx.FormValue("price"), 64)
	stock, _ := strconv.Atoi(ctx.FormValue("stock"))

	if name == "" || price <= 0 {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	file, _ := ctx.FormFile("image")

	filename, err := c.Service.Update(id, name, price, file, stock)
	if err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if file != nil && filename != "" {
		err := ctx.SaveFile(file, "./uploads/"+filename)
		if err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	// successful response update the product
	return ctx.JSON(fiber.Map{"message": "produk berhasil di update"})
}

// function to update stock
func (c *ProductController) UpdateStock(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))

	// function to parse body json
	var body struct {
		Delta int `json:"delta"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := c.Service.UpdateStock(id, body.Delta); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(fiber.Map{"message": "stock berhasil diupdate"})
}

// function to delete a product
func (c *ProductController) Delete(ctx *fiber.Ctx) error {
	// get product id to set delete
	id, _ := strconv.Atoi(ctx.Params("id"))
	if err := c.Service.Repo.Delete(id); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// successful response delete the product
	return ctx.JSON(fiber.Map{"message": "produk berhasil di hapus"})
}
