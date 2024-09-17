import {validate} from "../validation/validation.js";
import {loginUserValidation, registerUserValidation} from "../validation/user-validation.js";
import {prismaClient} from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { logger } from "../application/logging.js";

const register = async (request) => {
    
    const user = validate(registerUserValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            username : user.username
        }
    });

    if(countUser === 1){
        throw new ResponseError(400, "Username already exists");
    }

    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            username: true,
            name: true
        }
    });
}

const login = async (request) => {
    const loginRequest = validate(loginUserValidation, request.body);
    

    const user = await prismaClient.user.findUnique({
        where: {
            username: loginRequest.username
        },
        select: {
            username: true,
            name: true,
            password: true
        }
    });

    if(!user){
        throw new ResponseError(401, "Username or password wrong");
    }
    
    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
    
    if(!isPasswordValid){
        throw new ResponseError(401, "Username or password wrong");
    }

    const device = request.headers['device'] || 'Unknown Device';
    const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    const token = uuid().toString();
    const result = await prismaClient.token.create({
        data: {
            token: token,
            tokenUsername: user.username,
            device: device,
            ipAddress: ipAddress,
            userAgent: userAgent,
            createdAt: new Date(Date.now()),
            expiresAt: new Date(Date.now() + 3600000)
        },
    });

    return {
        username: user.username,
        name: user.name,
        token: result.token
    }

    // return data;
}

export default {
    register,
    login
}