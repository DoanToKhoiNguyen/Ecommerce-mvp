class DiscountPolicy {
    // Trả về % giảm giá theo điểm thành viên
    static percentFor(score) {
        if (score >= 1000) return 15;
        if (score >= 500) return 10;
        if (score >= 100) return 5;
        return 0;
    }
}
module.exports = DiscountPolicy;