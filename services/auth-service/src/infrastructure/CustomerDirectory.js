const BASE = process.env.CUSTOMER_URL || 'http://customer-service:3002';

// Hỏi Customer Service lấy fullname, trả null nếu không có hoặc lỗi
async function getFullname({ uid, role }) {
    try {
        const r = await fetch(`${BASE}/api/customers/${uid}`, {
            // Gọi nội bộ trong mạng Docker, tự gắn danh tính như gateway vẫn làm
            headers: { 'x-user-id': String(uid), 'x-user-role': role },
            signal: AbortSignal.timeout(2000),
        });
        if (!r.ok) return null;
        return (await r.json()).fullname || null;
    } catch (e) {
        console.error('[auth] cannot fetch fullname:', e.message);
        return null;
    }
}

module.exports = { getFullname };