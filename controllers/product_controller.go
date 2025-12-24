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

	file, _ := ctx.FormFile("image")

	if err := c.Service.Create(name, price, file); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	if file != nil {
		filename := file.Filename
		err := ctx.SaveFile(file, "./upload/"+filename)
		if err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
	}

	return ctx.JSON(fiber.Map{"message": "produk berhasil dibuat"})
}

func (c *ProductController) Update(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))

	var body struct {
		Name  string  `json:"name"`
		Price float64 `json:"price"`
	}
	ctx.BodyParser(&body)

	if body.Name == "" || body.Price <= 0 {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	if err := c.Service.Repo.Update(id, body.Name, body.Price); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(fiber.Map{"message": "produk berhasil di update"})
}

func (c *ProductController) Delete(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
	if err := c.Service.Repo.Delete(id); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"message": "produk berhasil di hapus"})
}
