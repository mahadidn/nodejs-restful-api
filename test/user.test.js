import supertest from "supertest";
import { web } from "../src/application/web.js"
import { prismaClient } from "../src/application/database";
import { logger } from "../src/application/logging.js";

describe('POST /api/users', () => {

    afterEach(async () => {
        await prismaClient.user.deleteMany({
            where: {
                username: "mahadi"
            }
        });
    });

    it('should can register new user', async () => {


        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: "mahadi",
                password: "rahasia",
                name: "Mahadi Dwi Nugraha"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("mahadi");
        expect(result.body.data.name).toBe("Mahadi Dwi Nugraha");
        expect(result.body.data.password).toBeUndefined();
    });

    it('should reject if request is invalid', async () => {


        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: "",
                password: "",
                name: ""
            });
        
        logger.error(result.body);
        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if username already registered', async () => {


        let result = await supertest(web)
            .post('/api/users')
            .send({
                username: "mahadi",
                password: "rahasia",
                name: "Mahadi Dwi Nugraha"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("mahadi");
        expect(result.body.data.name).toBe("Mahadi Dwi Nugraha");
        expect(result.body.data.password).toBeUndefined();

        result = await supertest(web)
            .post('/api/users')
            .send({
                username: "mahadi",
                password: "rahasia",
                name: "Mahadi Dwi Nugraha"
            });
        
        logger.error(result.body);
        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();

    });

})

