import { createClient } from '@supabase/supabase-js';

export function createSupabaseRepository({ url, key }) {
  if (!url || !key) {
    throw new Error('Supabase URL and Service Role Key (or API key) are required.');
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return {
    isSupabase: true,
    client: supabase,

    async getEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async createEvent(event) {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          description: event.description,
          image: event.image
        })
        .select('id')
        .single();
      if (error) throw error;
      return { id: Number(data.id) };
    },

    async updateEvent(id, event) {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          description: event.description,
          image: event.image
        })
        .eq('id', id)
        .select('id');
      if (error) throw error;
      return Boolean(data && data.length > 0);
    },

    async deleteEvent(id) {
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .select('id');
      if (error) throw error;
      return Boolean(data && data.length > 0);
    },

    async getApplications() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data || []).map(a => ({
        ...a,
        created: a.created || (a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString())
      }));
    },

    async hasApplicationEmail(email) {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .ilike('email', email.trim().toLowerCase())
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async createApplication({ name, email, phone, reason }) {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          reason: reason.trim(),
          status: 'pending'
        })
        .select('id')
        .single();
      if (error) throw error;
      return { id: Number(data.id) };
    },

    async updateApplicationStatus(id, status) {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select('id');
      if (error) throw error;
      return Boolean(data && data.length > 0);
    },

    async addSubscriber(email) {
      const { error } = await supabase
        .from('subscribers')
        .upsert(
          { email: email.trim().toLowerCase() },
          { onConflict: 'email', ignoreDuplicates: true }
        );
      if (error && error.code !== '23505') throw error;
      return true;
    },

    async getSubscribers() {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        created: s.created || (s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString())
      }));
    },

    async getAdminByEmail(email) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', email.trim().toLowerCase())
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },

    async upsertAdmin(email, hash, salt) {
      const normalized = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('admins')
        .upsert(
          { email: normalized, hash, salt },
          { onConflict: 'email' }
        )
        .select('id, email, hash, salt')
        .single();
      if (error) throw error;
      await supabase.from('sessions').delete().eq('admin_id', data.id);
      return data;
    },

    async createSession(tokenHash, adminId, expires) {
      const { error } = await supabase
        .from('sessions')
        .insert({
          token: tokenHash,
          admin_id: adminId,
          expires
        });
      if (error) throw error;
    },

    async getSession(tokenHash, now) {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('token, expires, admin_id')
        .eq('token', tokenHash)
        .gt('expires', now)
        .maybeSingle();
      if (error || !session) return null;

      const { data: admin, error: adminErr } = await supabase
        .from('admins')
        .select('email')
        .eq('id', session.admin_id)
        .maybeSingle();
      if (adminErr || !admin) return null;

      return {
        email: admin.email,
        admin_id: session.admin_id
      };
    },

    async deleteSession(tokenHash) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('token', tokenHash);
      if (error) throw error;
    },

    async cleanExpiredSessions(now) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .lte('expires', now);
      if (error) throw error;
    },

    async close() {
      // Supabase HTTP client has no persistent socket to close
      return Promise.resolve();
    }
  };
}
