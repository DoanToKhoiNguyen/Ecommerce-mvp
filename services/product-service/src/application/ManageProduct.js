const Product = require('../domain/Product');
const { AppError } = require('../domain/errors');

class ManageProduct {
    constructor({ productRepo }) { this.productRepo = productRepo; }

    async list() { return { items: await this.productRepo.findAll() }; }

    async get(pid) {
        const p = await this.productRepo.findByPid(pid);
        if (!p) throw new AppError(404, 'Product not found');
        return p;
    }

    async create(body) {
        Product.validate(body);
        const pid = await this.productRepo.nextPid();
        return this.productRepo.create({
            pid, pname: body.pname.trim(), price: body.price, quantity: body.quantity,
        });
    }

    async update(pid, body) {
        Product.validate(body, { partial: true });
        const fields = {};
        if (body.pname !== undefined) fields.pname = body.pname.trim();
        if (body.price !== undefined) fields.price = body.price;
        if (body.quantity !== undefined) fields.quantity = body.quantity;

        if (!(await this.productRepo.update(pid, fields))) throw new AppError(404, 'Product not found');
        return { message: 'Product updated successfully', pid };
    }

    async remove(pid) {
        if (!(await this.productRepo.delete(pid))) throw new AppError(404, 'Product not found');
        return { message: 'Product deleted successfully', pid };
    }
}
module.exports = ManageProduct;