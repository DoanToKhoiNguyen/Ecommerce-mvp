class RegisterCustomer {
    constructor({ customerRepo }) { this.customerRepo = customerRepo; }

    async execute({ uid, username }) {
        await this.customerRepo.createIfAbsent({ uid, fullname: username }); // fullname mặc định = username
    }
}
module.exports = RegisterCustomer;