import supertest from "supertest";
import { web } from "../src/application/web.js"
import { logger } from "../src/application/logging.js";
import { createTestUser, removeTestUser } from "./test-util.js";

// register
describe('POST /api/users', () => {

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can register new user', async () => {


        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: "mahadi",
                password: "rahasia",
                name: "Mahadi Dwi Nugraha"
            });

        logger.error(result);
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
        
        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();

    });

})


// login
describe('POST /api/users/login', () => {
    beforeEach( async () => {
        await createTestUser();
    });

    afterEach( async () => {
        await removeTestUser();
    });

    it('should can login', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .set('device', 'iPhone 12')
            .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1')
            .set('X-Forwarded-For', '192.168.1.5')
            .send({
                username: "mahadi",
                password: "rahasia"
            });

        logger.error(result.body.data);
        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
        expect(result.body.data.name).toBeDefined();

    });

})
