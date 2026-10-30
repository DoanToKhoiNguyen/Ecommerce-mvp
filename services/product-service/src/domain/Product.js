const { AppError } = require('./errors');

class Product {
    // partial = true: dùng cho PUT, chỉ kiểm tra những field có gửi lên
    static validate({ pname, price, quantity }, { partial = false } = {}) {
        if (partial && pname === undefined && price === undefined && quantity === undefined)
            throw new AppError(400, 'No fields to update');

        if (!partial || pname !== undefined) {
            if (typeof pname !== 'string' || !pname.trim() || pname.length > 100)
                throw new AppError(400, 'pname is required (1-100 characters)');
        }
        if (!partial || price !== undefined) {
            if (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
                throw new AppError(400, 'price must be a number >= 0');
        }
        if (!partial || quantity !== undefined) {
            if (!Number.isInteger(quantity) || quantity < 0)
                throw new AppError(400, 'quantity must be an integer >= 0');
        }
    }
}
module.exports = Product;