/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { BasketItemModel } from '../models/basketitem'
import { QuantityModel } from '../models/quantity'
import * as security from '../lib/insecurity'

function positiveIntegerFrom (value: unknown) {
  const numberValue = Number(value)
  return Number.isSafeInteger(numberValue) && numberValue > 0 ? numberValue : undefined
}

function requestBodyFrom (req: Request): Record<string, unknown> {
  return req.body != null && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {}
}

function authenticatedBasketId (req: Request) {
  return security.authenticatedUsers.from(req)?.bid
}

async function validateQuantity (req: Request, res: Response, productId: number, quantity: number) {
  const product = await QuantityModel.findOne({ where: { ProductId: productId } })
  if (product == null) throw new Error('No such product found!')

  if (product.limitPerUser && product.limitPerUser < quantity && !security.isDeluxe(req)) {
    res.status(400).json({ error: res.__('You can order only up to {{quantity}} items of this product.', { quantity: product.limitPerUser.toString() }) })
    return false
  }

  if (product.quantity < quantity) {
    res.status(400).json({ error: res.__('We are out of stock! Sorry for the inconvenience.') })
    return false
  }

  return true
}

export function getBasketItems () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basketId = authenticatedBasketId(req)
      if (!basketId) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' })
        return
      }

      const basketItems = await BasketItemModel.findAll({ where: { BasketId: basketId } })
      res.json({ status: 'success', data: basketItems })
    } catch (error) {
      next(error)
    }
  }
}

export function getBasketItem () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basketId = authenticatedBasketId(req)
      if (!basketId) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' })
        return
      }

      const basketItem = await BasketItemModel.findOne({ where: { id: req.params.id, BasketId: basketId } })
      if (basketItem === null) {
        res.status(404).json({ status: 'error', message: 'Basket item not found.' })
        return
      }

      res.json({ status: 'success', data: basketItem })
    } catch (error) {
      next(error)
    }
  }
}

export function addBasketItem () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basketId = authenticatedBasketId(req)
      if (!basketId) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' })
        return
      }

      const body = requestBodyFrom(req)
      const productId = positiveIntegerFrom(body.ProductId)
      const quantity = positiveIntegerFrom(body.quantity)
      if (!productId || !quantity) {
        res.status(400).json({ status: 'error', message: 'Invalid basket item.' })
        return
      }

      const existingItem = await BasketItemModel.findOne({ where: { ProductId: productId, BasketId: basketId } })
      const totalQuantity = (existingItem?.quantity ?? 0) + quantity
      if (!await validateQuantity(req, res, productId, totalQuantity)) return

      const basketItem = existingItem != null
        ? await existingItem.update({ quantity: totalQuantity })
        : await BasketItemModel.create({ ProductId: productId, BasketId: basketId, quantity })

      res.json({ status: 'success', data: basketItem })
    } catch (error) {
      next(error)
    }
  }
}

export function updateBasketItem () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basketId = authenticatedBasketId(req)
      const body = requestBodyFrom(req)
      const fields = Object.keys(body)
      const quantity = positiveIntegerFrom(body.quantity)

      if (!basketId) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' })
        return
      }

      if (fields.some(field => field !== 'quantity') || !quantity) {
        res.status(400).json({ status: 'error', message: 'Only quantity can be updated.' })
        return
      }

      const basketItem = await BasketItemModel.findOne({ where: { id: req.params.id, BasketId: basketId } })
      if (basketItem == null) {
        res.status(404).json({ status: 'error', message: 'Basket item not found.' })
        return
      }
      if (!await validateQuantity(req, res, basketItem.ProductId, quantity)) return

      const updatedBasketItem = await basketItem.update({ quantity })
      res.json({ status: 'success', data: updatedBasketItem })
    } catch (error) {
      next(error)
    }
  }
}

export function deleteBasketItem () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basketId = authenticatedBasketId(req)
      if (!basketId) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' })
        return
      }

      const basketItem = await BasketItemModel.findOne({ where: { id: req.params.id, BasketId: basketId } })
      if (basketItem == null) {
        res.status(404).json({ status: 'error', message: 'Basket item not found.' })
        return
      }

      await basketItem.destroy()
      res.json({ status: 'success', data: {} })
    } catch (error) {
      next(error)
    }
  }
}
