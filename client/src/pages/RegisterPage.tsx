import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function RegisterPage() {
      const navigate = useNavigate();
      const { register } = useAuth();

      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(false);

      async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
            event.preventDefault();

            try {
                  setLoading(true);
                  setError("");

                  await register({ name, email, password });
                  navigate('/products');
            } catch {
                  setError('Register failed. Try another email.');
            } finally {
                  setLoading(false);
            }
      }

      return (
            <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10">
                  <section className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">
                              NestCraft account
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold">Register</h1>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                              <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-3"
                              />
                              <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-3"
                              />
                              <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-3"
                              />

                              {error ? <p className="text-sm text-red-500">{error}</p> : null}

                              <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-full bg-walnut px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-clay"
                              >
                                    {loading ? 'Creating account...' : 'Register'}
                              </button>
                        </form>

                        <p className="mt-6 text-sm text-stone-600">
                              Already have an account?{' '}
                              <Link to="/login" className="font-semibold text-clay">
                                    Login
                              </Link>
                        </p>
                  </section>
            </main>
      )
}

export default RegisterPage;
