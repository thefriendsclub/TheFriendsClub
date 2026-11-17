import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, Users, CalendarDays, Mail, LayoutDashboard,
  LogOut, Plus, Search, Pencil, Trash2, Check, X, Download, ShieldCheck,
  Clock3, Database, RefreshCw
} from 'lucide-react';
import { api } from './api';
import DeveloperCredit from './DeveloperCredit';
import './admin-refined.css';
import { Brand, Modal, formatDate } from './main';
import { photos } from './data';

const blankEvent = { title: '', date: '', time: '', location: '', description: '', image: '' };

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({ applications: [], subscribers: [] });
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [application, setApplication] = useState(null);

  // Auto-dismiss notice notification after 5 seconds
  const noticeTimerRef = useRef(null);
  useEffect(() => {
    if (notice) {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = setTimeout(() => setNotice(''), 5000);
    }
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, [notice]);

  // Initial authentication check
  useEffect(() => {
    let active = true;
    api('/admin/me')
      .then(u => { if (active) setUser(u); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function refresh(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const [overview, eventList] = await Promise.all([
        api('/admin/overview'),
        api('/events')
      ]);
      setData(overview);
      setEvents(eventList);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to refresh data.');
    } finally {
      if (isManual) setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const formData = new FormData(e.currentTarget);
      const res = await api('/admin/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
      });
      setUser(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await api('/admin/logout', { method: 'POST' });
      setUser(null);
      setData({ applications: [], subscribers: [] });
      setEvents([]);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateApplication(id, next) {
    setBusy(true);
    try {
      await api(`/admin/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      setNotice(`Application marked as ${next}.`);
      setApplication(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEvent(e) {
    e.preventDefault();
    if (!editing.image.startsWith('https://')) {
      setError('Event image URL must start with https://');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api(`/admin/events${editing.id ? `/${editing.id}` : ''}`, {
        method: editing.id ? 'PUT' : 'POST',
        body: JSON.stringify(editing)
      });
      setEditing(null);
      setNotice('Event saved successfully.');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent() {
    setBusy(true);
    try {
      await api(`/admin/events/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      setNotice('Event deleted.');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const rows = [
      ['Name', 'Email', 'Phone', 'Status', 'Applied'],
      ...filtered.map(a => [a.name, a.email, a.phone, a.status, a.created])
    ];
    // Formula injection mitigation (OWASP standard prefix escaping)
    const csv = rows
      .map(row => row.map(v => `"${String(v || '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `friends-club-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.applications.filter(a => {
      const matchesStatus = status === 'all' || a.status === status;
      const matchesQuery = !q || `${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [data.applications, status, query]);

  const pendingCount = useMemo(() => {
    return data.applications.filter(a => a.status === 'pending').length;
  }, [data.applications]);

  const upcomingCount = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    return events.filter(e => e.date >= today).length;
  }, [events]);

  if (loading) {
    return (
      <div className="admin-loading" role="status" aria-live="polite">
        <img className="club-logo" src="/images/friends-club-logo.webp" alt="The Friends Club emblem" width="48" height="48" />
        <p>Opening the clubhouse…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="admin-login">
        <div className="login-art" style={{ backgroundImage: `linear-gradient(0deg,rgba(5,27,22,.9),rgba(5,27,22,.25)),url(/images/friendship-hero.webp)` }}>
          <Brand />
          <div>
            <p className="eyebrow gold">Behind every good memory</p>
            <h1>Good people.<br />Great things<br />together.</h1>
            <p>A little care behind the scenes.<br />A whole community out in the world.</p>
          </div>
          <span>THE FRIENDS CLUB · EST. 2006</span>
        </div>
        <div className="login-form-area">
          <a className="back-link" href="/"><ArrowLeft size={16} /> Back to the club</a>
          <form onSubmit={login}>
            <span className="admin-lock"><ShieldCheck size={25} /></span>
            <p className="eyebrow">The clubhouse</p>
            <h2>Welcome back.</h2>
            <p>Sign in to take care of your community.</p>
            <label>
              Email address
              <input name="email" type="email" autoComplete="username" placeholder="Your admin email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-button" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}<ArrowRight size={16} />
            </button>
            <p className="login-help">Administrator access only. Contact your site owner if you need an account.</p>
          </form>
          <span className="login-copyright">A community built on trust.</span>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <p className="eyebrow gold">Club management</p>
        <nav aria-label="Admin navigation">
          {[
            [LayoutDashboard, 'Overview'],
            [Users, 'Applications'],
            [CalendarDays, 'Events'],
            [Mail, 'Newsletter']
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={tab === label ? 'active' : ''}
              onClick={() => { setTab(label); setNotice(''); setError(''); }}
              aria-current={tab === label ? 'page' : undefined}
            >
              <Icon size={19} />
              {label}
              {label === 'Applications' && pendingCount > 0 && <span>{pendingCount}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer"><ArrowLeft size={17} /> View website</a>
          <button onClick={logout} disabled={busy}><LogOut size={17} /> Sign out</button>
          <small>{user.email}</small>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <span>The Friends Club <span>/ {tab}</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                background: user.database === 'Supabase' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                color: user.database === 'Supabase' ? '#4ade80' : '#facc15',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 500
              }}
              title={user.database === 'Supabase' ? 'Connected to live Supabase PostgreSQL' : 'Using local SQLite database'}
            >
              <Database size={12} />
              {user.database || 'Database'}
            </span>
            <button
              onClick={() => refresh(true)}
              disabled={refreshing}
              className="outline-action compact"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              title="Refresh overview data"
              aria-label="Refresh data"
            >
              <RefreshCw size={13} className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Syncing…' : 'Refresh'}
            </button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="admin-online" />
              Club administrator
              <span className="admin-avatar">{user.email[0].toUpperCase()}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-heading">
            <div>
              <p className="eyebrow">Your community, thoughtfully managed</p>
              <h1>{tab === 'Overview' ? 'Welcome to the clubhouse.' : tab}</h1>
              <p>
                {tab === 'Overview'
                  ? 'A real-time overview of members, applications, and calendar moments.'
                  : tab === 'Applications'
                  ? 'Meet the people ready to become part of our story.'
                  : tab === 'Events'
                  ? 'Create the moments everyone will remember.'
                  : 'People who want to stay in the loop.'}
              </p>
            </div>
            {tab === 'Events' && (
              <button className="submit-button compact" onClick={() => { setError(''); setEditing({ ...blankEvent }); }}>
                <Plus size={17} /> Create Event
              </button>
            )}
          </div>

          {error && (
            <div className="admin-alert error" role="alert">
              {error}
              <button onClick={() => refresh(true)}>Retry</button>
            </div>
          )}

          {notice && (
            <div className="admin-alert" role="status">
              <Check size={18} />
              {notice}
              <button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          )}

          {tab === 'Overview' && (
            <>
              <div className="admin-quick-actions">
                <button onClick={() => setTab('Applications')}><Users size={18} /> Review applications <ArrowRight size={15} /></button>
                <button onClick={() => { setTab('Events'); setEditing({ ...blankEvent }); }}><Plus size={18} /> Create an event <ArrowRight size={15} /></button>
                <a href="/" target="_blank" rel="noreferrer"><LayoutDashboard size={18} /> View club website <ArrowRight size={15} /></a>
              </div>

              <div className="dashboard-stats">
                {[
                  [Users, 'Applications', data.applications.length, 'People ready to connect'],
                  [Clock3, 'Awaiting review', pendingCount, 'A warm welcome starts here'],
                  [CalendarDays, 'Upcoming events', upcomingCount, 'More memories on the calendar'],
                  [Mail, 'Subscribers', data.subscribers.length, 'Keeping our community close']
                ].map(([Icon, title, count, caption]) => (
                  <div className="dashboard-stat" key={title}>
                    <div><span>{title}</span><Icon size={20} /></div>
                    <strong>{count}</strong>
                    <small>{caption}</small>
                  </div>
                ))}
              </div>

              <div className="dashboard-columns">
                <section className="admin-panel">
                  <div className="panel-heading">
                    <h3>Recent applications</h3>
                    <button onClick={() => setTab('Applications')}>View all <ArrowRight size={15} /></button>
                  </div>
                  {data.applications.length ? (
                    data.applications.slice(0, 5).map(a => (
                      <button className="recent-person" key={a.id} onClick={() => setApplication(a)}>
                        <span className="person-avatar">{a.name[0]}</span>
                        <span><strong>{a.name}</strong><small>{a.email}</small></span>
                        <span className={`status-badge ${a.status}`}>{a.status}</span>
                      </button>
                    ))
                  ) : (
                    <div className="admin-empty">
                      <Users size={30} />
                      <h3>Room for new friends.</h3>
                      <p>Membership applications will appear here.</p>
                      <a href="/">Visit the membership form <ArrowRight size={14} /></a>
                    </div>
                  )}
                </section>

                <section className="admin-panel">
                  <div className="panel-heading">
                    <h3>On the calendar</h3>
                    <button onClick={() => setTab('Events')}>Manage <ArrowRight size={15} /></button>
                  </div>
                  {events.slice(0, 3).map(e => (
                    <div className="calendar-event" key={e.id}>
                      <img src={e.image} alt={e.title} loading="lazy" />
                      <div>
                        <h4>{e.title}</h4>
                        <p>{formatDate(e.date)}</p>
                        <small>{e.location}</small>
                      </div>
                    </div>
                  ))}
                  {!events.length && (
                    <p className="admin-empty">Your calendar is waiting for its next great moment.</p>
                  )}
                </section>
              </div>
            </>
          )}

          {tab === 'Applications' && (
            <section className="admin-panel">
              <div className="table-tools">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    aria-label="Search applications"
                    placeholder="Search by name, email, or phone…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} aria-label="Clear search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select aria-label="Filter application status" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
                <button className="outline-action" onClick={exportCsv} disabled={!filtered.length}>
                  <Download size={16} /> Export CSV ({filtered.length})
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Phone</th>
                      <th>Applied</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.name}</strong><small>{a.email}</small></td>
                        <td>{a.phone}</td>
                        <td>{String(a.created).slice(0, 10)}</td>
                        <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                        <td>
                          <button className="text-button" onClick={() => setApplication(a)}>
                            Review <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <div className="admin-empty">
                  <Users />
                  <h3>No applications found.</h3>
                  <p>{query || status !== 'all' ? 'Try adjusting your search query or filter.' : 'New membership applications will appear here.'}</p>
                </div>
              )}
            </section>
          )}

          {tab === 'Events' && (
            <div className="admin-events">
              {events.map(e => (
                <article className="admin-event" key={e.id}>
                  <img src={e.image} alt={e.title} loading="lazy" />
                  <div>
                    <p className="eyebrow">{formatDate(e.date)}</p>
                    <h3>{e.title}</h3>
                    <p>{e.location} · {e.time}</p>
                    <p className="event-excerpt">{e.description}</p>
                    <div className="event-admin-actions">
                      <button onClick={() => { setError(''); setEditing({ ...e }); }}>
                        <Pencil size={15} /> Edit event
                      </button>
                      <button onClick={() => setDeleting(e)} aria-label={`Delete ${e.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!events.length && (
                <div className="admin-empty">
                  <CalendarDays />
                  <h3>A fresh calendar.</h3>
                  <p>Create your first event to bring people together.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'Newsletter' && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h3>Newsletter subscribers</h3>
                <span>{data.subscribers.length} subscribers</span>
              </div>
              <p className="panel-note">Collected email addresses for your club newsletter. Email campaigns are sent through your own email provider.</p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Email address</th>
                      <th>Subscribed on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subscribers.map(s => (
                      <tr key={s.id}>
                        <td>{s.email}</td>
                        <td>{String(s.created).slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.subscribers.length && (
                <div className="admin-empty">
                  <Mail />
                  <h3>The list starts here.</h3>
                  <p>Website newsletter signups will appear here.</p>
                </div>
              )}
            </section>
          )}

          <footer className="admin-footer">
            <span>THE FRIENDS CLUB N3 · EST. 2006</span>
            <DeveloperCredit />
          </footer>
        </div>
      </main>

      {editing && (
        <Modal title={editing.id ? 'Edit event' : 'Create event'} onClose={() => { if (!busy) setEditing(null); }}>
          <form className="modal-content event-form" onSubmit={saveEvent}>
            <p className="eyebrow">A new memory in the making</p>
            <h2>{editing.id ? 'Edit event' : 'Create an event'}</h2>
            {[
              ['title', 'Event name', 'text'],
              ['date', 'Date', 'date'],
              ['time', 'Time', 'text'],
              ['location', 'Location', 'text'],
              ['image', 'Image URL (HTTPS)', 'url']
            ].map(([key, label, type]) => (
              <label key={key}>
                {label}
                <input
                  type={type}
                  value={editing[key]}
                  required
                  maxLength={key === 'image' ? 2000 : 150}
                  onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Description
              <textarea
                value={editing.description}
                maxLength={3000}
                required
                rows={4}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-button" disabled={busy}>
              {busy ? 'Saving…' : 'Save Event'}<Check size={16} />
            </button>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete event" onClose={() => { if (!busy) setDeleting(null); }}>
          <div className="modal-content">
            <p className="eyebrow">Manage your calendar</p>
            <h2>Delete this event?</h2>
            <p>“{deleting.title}” will be removed from your website. This cannot be undone.</p>
            {error && <p className="form-error">{error}</p>}
            <div className="dialog-actions">
              <button className="outline-action" onClick={() => setDeleting(null)} disabled={busy}>
                Keep event
              </button>
              <button className="danger-button" onClick={deleteEvent} disabled={busy}>
                {busy ? 'Deleting…' : 'Delete event'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {application && (
        <Modal title="Review application" onClose={() => setApplication(null)}>
          <div className="modal-content">
            <p className="eyebrow">A new connection</p>
            <h2>{application.name}</h2>
            <span className={`status-badge ${application.status}`}>{application.status}</span>
            <dl className="application-details">
              <dt>Email</dt>
              <dd>{application.email}</dd>
              <dt>Phone</dt>
              <dd>{application.phone}</dd>
              <dt>Reason for joining</dt>
              <dd>{application.reason}</dd>
              <dt>Applied</dt>
              <dd>{String(application.created)}</dd>
            </dl>
            <div className="review-actions">
              {['approved', 'declined', 'pending']
                .filter(s => s !== application.status)
                .map(s => (
                  <button
                    disabled={busy}
                    key={s}
                    className={s === 'approved' ? 'submit-button' : 'outline-action'}
                    onClick={() => updateApplication(application.id, s)}
                  >
                    {s === 'approved' ? 'Approve membership' : s === 'declined' ? 'Decline' : 'Return to pending'}
                  </button>
                ))}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
