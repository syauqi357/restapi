package controllers

import (
	"strconv"

	"galon/services"

	"github.com/gofiber/fiber/v2"
)

type ProductController struct {
	Service *services.ProductService
}

func (c *ProductController) GetAll(ctx *fiber.Ctx) error {
	products, err := c.Service.Repo.GetAll()
	if err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(products)
}

func (c *ProductController) GetByID(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
	product, err := c.Service.Repo.GetByID(id)
	if err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "product not found"})
	}
	return ctx.JSON(product)
}

func (c *ProductController) Create(ctx *fiber.Ctx) error {
	name := ctx.FormValue("name")
	price, _ := strconv.ParseFloat(ctx.FormValue("price"), 64)
	stock, _ := strconv.Atoi(ctx.FormValue("stock"))

	file, _ := ctx.FormFile("image")

	filename, err := c.Service.Create(name, price, file, stock)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if file != nil && filename != "" {
		err := ctx.SaveFile(file, "./upload/"+filename)
		if err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	return ctx.JSON(fiber.Map{"message": "produk berhasil dibuat"})
}

func (c *ProductController) Update(ctx *fiber.Ctx) error {
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
		err := ctx.SaveFile(file, "./upload/"+filename)
		if err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	return ctx.JSON(fiber.Map{"message": "produk berhasil di update"})
}

func (c *ProductController) UpdateStock(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
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

func (c *ProductController) Delete(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
	if err := c.Service.Repo.Delete(id); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"message": "produk berhasil di hapus"})
}
