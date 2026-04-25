jest.mock("../src/models/reserva.model", () => ({
  createReserva: jest.fn(),
  listMisReservas: jest.fn(),
  cancelReserva: jest.fn(),
}));

const Reserva = require("../src/models/reserva.model");
const ReservaController = require("../src/controllers/reserva.controller");

describe("ReservaController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("create", () => {
    test("debe retornar 400 si idLibro no es válido", async () => {
      req.params.idLibro = "abc";

      await ReservaController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "idLibro invalido" });
    });

    test("debe retornar 201 si la reserva se crea correctamente", async () => {
      req.params.idLibro = "5";

      Reserva.createReserva.mockResolvedValue({
        message: "Reserva creada exitosamente",
        id_reserva: 10,
      });

      await ReservaController.create(req, res);

      expect(Reserva.createReserva).toHaveBeenCalledWith(1, 5);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reserva creada exitosamente",
        id_reserva: 10,
      });
    });

    test("debe retornar 409 si el usuario alcanza el límite de reservas", async () => {
      req.params.idLibro = "5";

      Reserva.createReserva.mockRejectedValue(
        new Error("Limite de 3 reservas activas alcanzado"),
      );

      await ReservaController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Limite de 3 reservas activas alcanzado",
      });
    });

    test("debe retornar 404 si el libro no existe", async () => {
      req.params.idLibro = "99";

      Reserva.createReserva.mockRejectedValue(new Error("Libro no existe"));

      await ReservaController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Libro no existe",
      });
    });
  });

  describe("myList", () => {
    test("debe listar las reservas del usuario", async () => {
      const reservasMock = [
        { id_reserva: 1, title: "Clean Code", estado: "activa" },
        { id_reserva: 2, title: "Rayuela", estado: "cancelada" },
      ];

      Reserva.listMisReservas.mockResolvedValue(reservasMock);

      await ReservaController.myList(req, res);

      expect(Reserva.listMisReservas).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ reservas: reservasMock });
    });
  });

  describe("cancel", () => {
    test("debe retornar 400 si idReserva no es válido", async () => {
      req.params.idReserva = "xyz";

      await ReservaController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "idReserva invalido" });
    });

    test("debe cancelar una reserva correctamente", async () => {
      req.params.idReserva = "2";

      Reserva.cancelReserva.mockResolvedValue({
        message: "Reserva cancelada correctamente",
      });

      await ReservaController.cancel(req, res);

      expect(Reserva.cancelReserva).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reserva cancelada correctamente",
      });
    });

    test("debe retornar 404 si la reserva no existe", async () => {
      req.params.idReserva = "2";

      Reserva.cancelReserva.mockRejectedValue(
        new Error("Reserva no encontrada"),
      );

      await ReservaController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reserva no encontrada",
      });
    });
  });
});
