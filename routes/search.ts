/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { Op } from 'sequelize'

import * as utils from '../lib/utils'
import { ProductModel } from '../models/product'

// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge
export function searchProducts () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let criteria = typeof req.query.q === 'string' && req.query.q !== 'undefined' ? req.query.q : ''
      criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
      const products = await ProductModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${criteria}%` } },
            { description: { [Op.like]: `%${criteria}%` } }
          ]
        },
        order: [['name', 'ASC']],
        raw: true
      })
      for (let i = 0; i < products.length; i++) {
        products[i].name = req.__(products[i].name)
        products[i].description = req.__(products[i].description)
      }
      res.json(utils.queryResultToJson(products))
    } catch (error) {
      next(error)
    }
  }
}
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
