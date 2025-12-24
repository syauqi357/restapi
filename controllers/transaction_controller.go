package controllers

import (
	"strconv"

	"galon/services"
	"github.com/gofiber/fiber/v2"
)

type TransactionController struct {
	Service *services.TransactionService
}

func (c *TransactionController) GetAll(ctx *fiber.Ctx) error {
	data, err := c.Service.GetAll()
	if err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(data)
}

func (c *TransactionController) Create(ctx *fiber.Ctx) error {
	productID, _ := strconv.Atoi(ctx.FormValue("product_id"))
	quantity, _ := strconv.Atoi(ctx.FormValue("quantity"))

	if err := c.Service.Create(productID, quantity); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(fiber.Map{"message": "transaksi berhasil dibuat"})
}
