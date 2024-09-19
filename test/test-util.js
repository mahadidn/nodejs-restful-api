import { prismaClient } from "../src/application/database";
import bcrypt from "bcrypt";
import { logger } from "../src/application/logging";

export const removeTestUser = async () => {

    const token = await prismaClient.token.findFirst({
        where: {
            tokenUsername: "mahadi"
        }
    });
    if(token){
        await prismaClient.token.deleteMany({
            where: {
                tokenUsername: "mahadi"
            }
        });
        
        await prismaClient.user.delete({
            where: {
                username: "mahadi"
            }
        });
    }

    const user = await prismaClient.user.findUnique({
        where: {
            username: "mahadi"
        }
    });

    if(user){
        await prismaClient.user.delete({
            where: {
                username: "mahadi"
            }
        });
    }

    

}

export const createTestUser = async () => {
    const user = await prismaClient.user.create({
        data: {
            username: "mahadi",
            password: await bcrypt.hash("rahasia", 10),
            name: "Mahadi Dwi Nugraha"
        }
    });

    await prismaClient.token.create({
        data: {
            token: "test",
            tokenUsername: user.username,
            device: "laptop",
            ipAddress: "192.168.1.1",
            userAgent: "mdn run time",
            expiresAt: new Date(Date.now() + 36000000),
        },
    });

}


export const getTestUser = async () => {
    return prismaClient.user.findUnique({
        where: {
            username: "mahadi"
        }
    });
}