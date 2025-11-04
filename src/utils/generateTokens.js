
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
}


const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, username: user.username, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: '30d' }
    );
    const refreshToken = jwt.sign(
        { userId: user._id, username: user.username, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: '45d' }
    );
    return { accessToken, refreshToken };
};

export default generateTokens;