import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secret-dev-key";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({
                message: "User not found",
            },
            {
                status: 401
            });
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({
                message: "Invalid credentials"
            }, {
                status: 401
            })
        }

        const token = signToken(
            {
                email: user.email,
                role: user.role
            }
        );

        return NextResponse.json({
            token
        })
    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong"
        }, {
            status: 500
        })
    }
}