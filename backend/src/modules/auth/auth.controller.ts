import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { Role } from "../../../generated/prisma/index.js"

function authToken(req: Request, res: Response, next: NextFunction) {

    const cookieToken = req.cookies.access_token
    const secretKey = process.env.JWT_SECRET

    if (!secretKey) {
        return res.status(500).json({ error: "AccessToken não definido" })
    }

    if (!cookieToken) {
        return res.status(401).json({ error: "Acesso negado" })
    }

    try {
        const userVerifed = jwt.verify(cookieToken, secretKey)

        if (typeof userVerifed !== "object" || userVerifed === null) {
            return res.status(401).json({ error: "Token Invalido" })
        }

        req.user = {
            id: userVerifed.id as number,
            role: userVerifed.role as Role
        }
        next()
    } catch (error) {
        return res.status(400).json({ error: "Token inválido" })
    }
}

export default authToken
