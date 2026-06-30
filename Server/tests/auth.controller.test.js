jest.mock('../src/models/user.model', () => ({
    findByEmail: jest.fn(),
    create: jest.fn()
}));

jest.mock('../src/models/reset_token.model', () => ({
    createToken: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn()
}));

jest.mock('../src/utils/emailTemplates', () => ({
    resetPasswordTemplate: jest.fn(() => '<html>mock</html>')
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' })
    }))
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

describe('AuthController', () => {
    let AuthController;
    let User;
    let bcrypt;
    let jwt;
    let req;
    let res;

    beforeEach(() => {
        jest.resetModules();

        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRES_IN = '1h';

        User = require('../src/models/user.model');
        bcrypt = require('bcryptjs');
        jwt = require('jsonwebtoken');
        AuthController = require('../src/controllers/auth.controller');

        req = { body: {} };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('register', () => {

        test('debe retornar 400 si faltan campos obligatorios', async () => {
            req.body = { nombre: 'Kevin' };

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Todos los campos son obligatorios'
            });
        });

        test('debe retornar 409 si el correo ya esta registrado', async () => {
            req.body = {
                nombre: 'Kevin',
                apellido: 'Lopez',
                tipo_documento: 'CC',
                numero_documento: '123',
                fecha_nacimiento: '2000-01-01',
                correo: 'kevin@test.com',
                password: '123456'
            };

            User.findByEmail.mockResolvedValue({ id_usuario: 1, correo: 'kevin@test.com' });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'El correo ya esta registrado'
            });
        });

        test('debe crear el usuario correctamente', async () => {
            req.body = {
                nombre: 'Kevin',
                apellido: 'Lopez',
                tipo_documento: 'CC',
                numero_documento: '123',
                fecha_nacimiento: '2000-01-01',
                correo: 'kevin@test.com',
                password: '123456'
            };

            User.findByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed_password');
            User.create.mockResolvedValue(25);

            await AuthController.register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
            expect(User.create).toHaveBeenCalledWith({
                nombre: 'Kevin',
                apellido: 'Lopez',
                tipo_documento: 'CC',
                numero_documento: '123',
                fecha_nacimiento: '2000-01-01',
                correo: 'kevin@test.com',
                password_hash: 'hashed_password'
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuario creado exitosamente',
                userId: 25
            });
        });
    });

    describe('login', () => {

        test('debe retornar 400 si faltan correo o contrasena', async () => {
            req.body = { correo: '' };

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Todos los campos son obligatorios'
            });
        });

        test('debe retornar 401 si el usuario no existe', async () => {
            req.body = { correo: 'kevin@test.com', password: '123456' };

            User.findByEmail.mockResolvedValue(null);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Credenciales invalidas'
            });
        });

        test('debe retornar 403 si el usuario esta inactivo', async () => {
            req.body = { correo: 'kevin@test.com', password: '123456' };

            User.findByEmail.mockResolvedValue({
                id_usuario: 1,
                correo: 'kevin@test.com',
                estado: 'inactivo',
                password_hash: 'hash',
                tipo: 'lector'
            });

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario inactivo' });
        });

        test('debe retornar 401 si la contrasena es incorrecta', async () => {
            req.body = { correo: 'kevin@test.com', password: '123456' };

            User.findByEmail.mockResolvedValue({
                id_usuario: 1,
                nombre: 'Kevin',
                correo: 'kevin@test.com',
                estado: 'activo',
                password_hash: 'hash_guardado',
                tipo: 'lector'
            });

            bcrypt.compare.mockResolvedValue(false);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Credenciales invalidas'
            });
        });

        test('debe iniciar sesion correctamente y retornar token', async () => {
            req.body = { correo: 'kevin@test.com', password: '123456' };

            User.findByEmail.mockResolvedValue({
                id_usuario: 1,
                nombre: 'Kevin',
                correo: 'kevin@test.com',
                estado: 'activo',
                password_hash: 'hash_guardado',
                tipo: 'admin'
            });

            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fake_jwt_token');

            await AuthController.login(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, correo: 'kevin@test.com', role: 'admin' },
                'test_secret',
                { expiresIn: '1h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login exitoso',
                token: 'fake_jwt_token',
                user: {
                    id: 1,
                    nombre: 'Kevin',
                    correo: 'kevin@test.com',
                    role: 'admin'
                }
            });
        });
    });
});
