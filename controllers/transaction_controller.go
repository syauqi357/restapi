package controllers

import (
	"galon/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// TransactionController handles transaction-related HTTP requests.
type TransactionController struct {
	Service *services.TransactionService
}

// GetAll retrieves all transactions.
func (c *TransactionController) GetAll(ctx *fiber.Ctx) error {
	data, err := c.Service.GetAll()
	if err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// return context with data
	return ctx.JSON(data)
}

// GetByID retrieves a transaction by its ID.
func (c *TransactionController) GetByID(ctx *fiber.Ctx) error {
	id, _ := strconv.Atoi(ctx.Params("id"))
	transaction, err := c.Service.GetByID(id)
	if err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "transaction not found"})
	}
	return ctx.JSON(transaction)
}

// function to create a new transaction
func (c *TransactionController) Create(ctx *fiber.Ctx) error {
	// parse body json by structuring the body product id and quantity
	var body struct {
		ProductID int `json:"product_id"`
		Quantity  int `json:"quantity"`
	}

	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := c.Service.Create(body.ProductID, body.Quantity); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(fiber.Map{"message": "transaksi berhasil dibuat"})
}

// function to update a transaction
func (c *TransactionController) Update(ctx *fiber.Ctx) error {
	// get transaction id to set update
	id, _ := strconv.Atoi(ctx.Params("id"))
	var body struct {
		ProductID int `json:"product_id"`
		Quantity  int `json:"quantity"`
	}
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := c.Service.Update(id, body.ProductID, body.Quantity); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(fiber.Map{"message": "transaksi berhasil diupdate"})
}

// function to delete a transaction
func (c *TransactionController) Delete(ctx *fiber.Ctx) error {
	// get transaction id to set delete
	id, _ := strconv.Atoi(ctx.Params("id"))
	if err := c.Service.Delete(id); err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"message": "transaksi berhasil dihapus"})
}
