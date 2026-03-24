import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Policy {
  id: string;
  title: string;
  type: string;
  content: string;
  version: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  urgency: string;
  createdAt: string;
}

interface SupportState {
  policies: Policy[];
  faqs: FAQ[];
  myTickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  fetchPolicies: () => Promise<void>;
  fetchFAQs: () => Promise<void>;
  fetchMyTickets: () => Promise<void>;
  createTicket: (category: string, urgency: string, description: string) => Promise<{ success: boolean; message: string }>;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  policies: [],
  faqs: [],
  myTickets: [],
  isLoading: false,
  error: null,

  fetchPolicies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/support/policies`);
      if (response.data.success) {
        set({ policies: response.data.data });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch policies' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFAQs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/support/faqs`);
      if (response.data.success) {
        set({ faqs: response.data.data });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch FAQs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyTickets: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/support/tickets/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        set({ myTickets: response.data.data });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch tickets' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTicket: async (category, urgency, description) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'Not authenticated' };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/support/tickets`, {
        category,
        urgency,
        description,
        subject: `Issue in ${category}` // Simple subject for now
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await get().fetchMyTickets();
        return { success: true, message: 'Ticket created successfully' };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create ticket';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isLoading: false });
    }
  }
}));
