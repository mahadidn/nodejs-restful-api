import supertest from "supertest";
import { web } from "../src/application/web.js"
import { logger } from "../src/application/logging.js";
import { createTestUser, getTestUser, getTokenUser, removeTestUser } from "./test-util.js";
import bcrypt from "bcrypt";

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

        // logger.error(result);
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

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
        expect(result.body.data.name).toBeDefined();

    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .set('device', 'iPhone 12')
            .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1')
            .set('X-Forwarded-For', '192.168.1.5')
            .send({
                username: "",
                password: ""
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if password is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .set('device', 'iPhone 12')
            .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1')
            .set('X-Forwarded-For', '192.168.1.5')
            .send({
                username: "mahadi",
                password: "fjsndd"
            });

        // logger.error(result);
        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

})


// cek user login
describe('GET /api/users/current', () => {
    beforeEach( async () => {
        await createTestUser();
    });

    afterEach( async () => {
        await removeTestUser();
    });



    it('should can get current user', async () => {
        const result = await supertest(web)
            .post('/api/users/current')
            .set('Authorization', 'test');


        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('mahadi');
        expect(result.body.data.name).toBe('Mahadi Dwi Nugraha');
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users/current')
            .set('Authorization', 'salah');


        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

})


describe('PATCH /api/users/current', () => {
    beforeEach( async () => {
        await createTestUser();
    });

    afterEach( async () => {
        await removeTestUser();
    });

    it('should can update user', async () => {
        const result = await supertest(web)
                        .patch('/api/users/current')
                        .set('Authorization', 'test')
                        .send({
                            name: "mdn",
                            password: "mdnlagi123"
                        });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('mahadi');
        expect(result.body.data.name).toBe('mdn');

        const user = await getTestUser();
        expect(await bcrypt.compare("mdnlagi123", user.password)).toBe(true);

    });

    it('should can update user name', async () => {
        const result = await supertest(web)
                        .patch('/api/users/current')
                        .set('Authorization', 'test')
                        .send({
                            name: "mdn"
                        });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('mahadi');
        expect(result.body.data.name).toBe('mdn');

        const user = await getTestUser();
        expect(await bcrypt.compare("rahasia", user.password)).toBe(true);

    });

    it('should can update user password', async () => {
        const result = await supertest(web)
                        .patch('/api/users/current')
                        .set('Authorization', 'test')
                        .send({
                            password: "mdnlagi123"
                        });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('mahadi');
        expect(result.body.data.name).toBe('Mahadi Dwi Nugraha');

        const user = await getTestUser();
        expect(await bcrypt.compare("mdnlagi123", user.password)).toBe(true);

    });

    it('should reject if request is not valid', async () => {
        const result = await supertest(web)
                        .patch('/api/users/current')
                        .set('Authorization', 'salah')
                        .send({});

        expect(result.status).toBe(401);

    });

})


describe('DELETE /api/users/logout', () => {

    beforeEach( async () => {
        await createTestUser();
    });

    afterEach( async () => {
        await removeTestUser();
    });

    it('should be able to logout', async () => {
        const result = await supertest(web)
                        .delete('/api/users/logout')
                        .set('Authorization', 'test');

        
        expect(result.status).toBe(200);
        expect(result.body.data).toBe("OK");

        const user = await getTokenUser();
        expect(user).toBeNull();
    });

    it('should reject logout if token is invalid', async () => {
        const result = await supertest(web)
                        .delete('/api/users/logout')
                        .set('Authorization', 'salah');

        
        expect(result.status).toBe(401);
    });

});
