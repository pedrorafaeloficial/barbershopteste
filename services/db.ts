
import { Client, Appointment, Service } from '../types';

export const db = {
  // Clientes
  getClients: async (): Promise<Client[]> => {
    const data = localStorage.getItem('pg_clients');
    return data ? JSON.parse(data) : [];
  },

  saveClient: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const clients = await db.getClients();
    const newClient: Client = { 
      ...client, 
      id: crypto.randomUUID(),
      loyaltyPoints: client.loyaltyPoints || 0 
    };
    localStorage.setItem('pg_clients', JSON.stringify([...clients, newClient]));
    return newClient;
  },

  // Serviços
  getServices: async (): Promise<Service[]> => {
    // SQL: SELECT * FROM services ORDER BY name ASC;
    const data = localStorage.getItem('pg_services');
    if (!data) {
      // Seed inicial
      const initialServices: Service[] = [
        { id: '1', name: 'Corte Social', price: 45, duration: 40 },
        { id: '2', name: 'Barba Premium', price: 35, duration: 30 },
        { id: '3', name: 'Combo (Corte + Barba)', price: 70, duration: 60 }
      ];
      localStorage.setItem('pg_services', JSON.stringify(initialServices));
      return initialServices;
    }
    return JSON.parse(data);
  },

  saveService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    const services = await db.getServices();
    const newService: Service = { ...service, id: crypto.randomUUID() };
    console.log(`POSTGRES EXEC: INSERT INTO services (name, price, duration) VALUES ('${newService.name}', ${newService.price}, ${newService.duration});`);
    localStorage.setItem('pg_services', JSON.stringify([...services, newService]));
    return newService;
  },

  deleteService: async (id: string): Promise<void> => {
    const services = await db.getServices();
    localStorage.setItem('pg_services', JSON.stringify(services.filter(s => s.id !== id)));
  },

  // Agendamentos
  getAppointments: async (): Promise<Appointment[]> => {
    const data = localStorage.getItem('pg_appointments');
    return data ? JSON.parse(data) : [];
  },

  createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const appointments = await db.getAppointments();
    const newApt: Appointment = { ...appointment, id: crypto.randomUUID() };
    localStorage.setItem('pg_appointments', JSON.stringify([...appointments, newApt]));
    return newApt;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const appointments = await db.getAppointments();
    localStorage.setItem('pg_appointments', JSON.stringify(appointments.filter(a => a.id !== id)));
  }
};
