const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index'); // Lancer l'application
const Professional = require('../src/models/professional.model'); // Modèle

describe('Professional Management API', () => {
  // Avant tous les tests, on connecte une base MongoDB temporaire
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Après tous les tests, on supprime la base temporaire
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Supprimer les données avant chaque test
  beforeEach(async () => {
    await Professional.deleteMany({});
  });

  /** ---------------------
   * Test Endpoint: POST /api/professionals
   * --------------------- */
  describe('POST /api/professionals', () => {
    it('devrait créer un nouveau professionnel', async () => {
      const professionalData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        profession: 'Consultant',
        services: [{ name: 'IT Audit', price: 500, description: 'Audit complet' }],
        availability: { Monday: ['09:00', '11:00'] },
      };

      const res = await request(app).post('/api/professionals').send(professionalData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('johndoe@example.com');
    });

    it('devrait retourner une erreur si les données sont invalides', async () => {
      const invalidData = {
        email: 'not-an-email', // Email invalide
        profession: 'Consultant',
      };

      const res = await request(app).post('/api/professionals').send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  /** ---------------------
   * Test Endpoint: GET /api/professionals
   * --------------------- */
  describe('GET /api/professionals', () => {
    it('devrait retourner une liste de professionnels', async () => {
      // Ajouter quelques professionnels à la base
      await Professional.create([
        { name: 'John Doe', email: 'johndoe@example.com', profession: 'Consultant' },
        { name: 'Jane Smith', email: 'janesmith@example.com', profession: 'Designer' },
      ]);

      const res = await request(app).get('/api/professionals');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name', 'John Doe');
      expect(res.body[1]).toHaveProperty('name', 'Jane Smith');
    });

    it('devrait retourner une liste vide si aucun professionnel', async () => {
      const res = await request(app).get('/api/professionals');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  /** ---------------------
   * Test Endpoint: GET /api/professionals/:id
   * --------------------- */
  describe('GET /api/professionals/:id', () => {
    it('devrait retourner un professionnel par ID', async () => {
      const professional = await Professional.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        profession: 'Consultant',
      });

      const res = await request(app).get(`/api/professionals/${professional._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', professional._id.toString());
    });

    it('devrait retourner une erreur si l’ID est invalide', async () => {
      const res = await request(app).get('/api/professionals/invalid-id');
      expect(res.status).toBe(400);
    });

    it('devrait retourner une erreur si le professionnel n’existe pas', async () => {
      const res = await request(app).get(`/api/professionals/${mongoose.Types.ObjectId()}`);
      expect(res.status).toBe(404);
    });
  });

  /** ---------------------
   * Test Endpoint: PUT /api/professionals/:id
   * --------------------- */
  describe('PUT /api/professionals/:id', () => {
    it('devrait mettre à jour un professionnel existant', async () => {
      const professional = await Professional.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        profession: 'Consultant',
      });

      const updatedData = { name: 'John Updated', profession: 'Updated Consultant' };

      const res = await request(app).put(`/api/professionals/${professional._id}`).send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'John Updated');
      expect(res.body).toHaveProperty('profession', 'Updated Consultant');
    });

    it('devrait retourner une erreur si les données sont invalides', async () => {
      const professional = await Professional.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        profession: 'Consultant',
      });

      const res = await request(app).put(`/api/professionals/${professional._id}`).send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
    });
  });

  /** ---------------------
   * Test Endpoint: DELETE /api/professionals/:id
   * --------------------- */
  describe('DELETE /api/professionals/:id', () => {
    it('devrait supprimer un professionnel existant', async () => {
      const professional = await Professional.create({
        name: 'John Doe',
        email: 'johndoe@example.com',
        profession: 'Consultant',
      });

      const res = await request(app).delete(`/api/professionals/${professional._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Professional deleted successfully');
    });

    it('devrait retourner une erreur si le professionnel n’existe pas', async () => {
      const res = await request(app).delete(`/api/professionals/${mongoose.Types.ObjectId()}`);
      expect(res.status).toBe(404);
    });
  });
});
