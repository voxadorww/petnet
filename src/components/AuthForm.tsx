import { useState } from 'react';
import { createClient } from '../utils/supabase/client.tsx';
import { api } from '../utils/api.tsx';

interface AuthFormProps {
  onAuthSuccess: (accessToken: string, userId: string) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (data.session) {
          onAuthSuccess(data.session.access_token, data.user.id);
        }
      } else {
        const result = await api.signup(email, password, petName, species, breed, parseInt(age));
        
        if (result.error) throw new Error(result.error);

        // Sign in after signup
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (data.session) {
          onAuthSuccess(data.session.access_token, data.user.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#240046] to-[#3c096c]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(157, 78, 221, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(199, 125, 255, 0.2) 0%, transparent 50%)',
        }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-[#140a2e]/90 to-[#240046]/90 backdrop-blur-lg rounded-3xl p-8 border border-[#9d4edd]/30 shadow-2xl shadow-[#9d4edd]/20">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl mb-2 bg-gradient-to-r from-[#c77dff] to-[#9d4edd] bg-clip-text text-transparent">
              🐾 PetNet
            </h1>
            <p className="text-[#c8b8e6]">Social Media for Pets</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#ff006e]/20 border border-[#ff006e] rounded-lg text-[#ff006e]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-[#e8e4ff]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-[#e8e4ff]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block mb-2 text-[#e8e4ff]">Pet Name</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] transition-colors"
                    placeholder="Fluffy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[#e8e4ff]">Species</label>
                    <select
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] focus:outline-none focus:border-[#9d4edd] transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-[#e8e4ff]">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] transition-colors"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-[#e8e4ff]">Breed</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#140a2e]/80 border border-[#9d4edd]/30 rounded-xl text-[#e8e4ff] placeholder-[#c8b8e6]/50 focus:outline-none focus:border-[#9d4edd] transition-colors"
                    placeholder="Golden Retriever"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#9d4edd] to-[#7209b7] text-white rounded-xl hover:shadow-lg hover:shadow-[#9d4edd]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#c77dff] hover:text-[#9d4edd] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
