// pages/index.tsx
'use client';

import { useState } from 'react';
import Head from 'next/head';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  FiMic,
  FiPlus,
  FiMoon,
  FiSun,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiLogOut,
} from 'react-icons/fi';

const nutritionKeys = ['calories', 'protein', 'carbs', 'fat'] as const;
type NutritionKey = typeof nutritionKeys[number];

const COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171'];
const GOOGLE_CLIENT_ID = '378903500840-emqlik205crbf9p9ddtd1cdog910m23d.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export default function NutritionApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [nutrition, setNutrition] = useState<Record<NutritionKey, number>>({
    calories: 1200,
    protein: 60,
    carbs: 150,
    fat: 40,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aiInput, setAiInput] = useState('');


  const handleSettingChange = (key: NutritionKey, value: number) => {
    setNutrition(prev => ({ ...prev, [key]: value }));
  };

  const chartData = nutritionKeys.map(key => ({
    name: capitalize(key),
    value: nutrition[key],
  }));





  const handleCalendarSync = async () => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          const gapi = (window as any).gapi;

          await gapi.load('client', async () => {
            alert("client start")
            await gapi.client.init({
              apiKey: '', // Not needed for OAuth2, can be left blank
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            alert("token start")

            gapi.client.setToken({ access_token: tokenResponse.access_token });

            const event = {
              summary: 'Nutrition Log',
              description: 'Daily nutrition summary',
              start: {
                dateTime: new Date().toISOString(),
                timeZone: 'UTC',
              },
              end: {
                dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                timeZone: 'UTC',
              },
            };

            await gapi.client.calendar.events.insert({
              calendarId: 'primary',
              resource: event,
            });

            alert('Event added to your Google Calendar.');
          });
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      console.error('Calendar Sync Error:', err);
      alert('Google Calendar sync failed.');
    }
  };



  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} min-h-screen p-4 sm:p-8 relative`}>
      <Head>
        <title>Nutrition Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script src="https://apis.google.com/js/api.js" async defer></script>
        <script src="coi-serviceworker.min.js"></script>

      </Head>

      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-3xl font-bold text-center w-full">🍽 Daily Nutrition Tracker</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-auto p-2 rounded-full"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>

        <div className="my-4 space-y-2">
          {nutritionKeys.map((key, index) => (
            <div key={key} className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium capitalize">{key}</span>
                <span className="text-sm">{nutrition[key]}{key === 'calories' ? ' kcal' : ' g'}</span>
              </div>
              <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.min((nutrition[key] / 2000) * 100, 100)}%`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-l ${activeTab === 'dashboard' ? 'bg-teal-400 text-white' : (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800')}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-r flex items-center gap-1 ${activeTab === 'settings' ? 'bg-teal-400 text-white' : (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800')}`}
          >
            <FiSettings /> Settings
          </button>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <div className="space-y-4">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {nutritionKeys.map(key => (
            <NutritionCard
              key={key}
              label={capitalize(key)}
              value={nutrition[key]}
              unit={key === 'calories' ? 'kcal' : 'g'}
            />
          ))}

          <div className="mt-6">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }}
              placeholder="Ask something about your nutrition..."
              rows={1}
              className="w-full min-h-[3rem] p-4 rounded-3xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none overflow-hidden transition-all"
            />
          </div>

          {false ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
              <p className="text-sm">Signed in as user</p>
              <div className="flex gap-2">
                <button onClick={handleCalendarSync} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                  <FiCalendar /> Sync to Calendar
                </button>
                <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white rounded">
                  <FiLogOut /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => handleCalendarSync()} className="px-4 py-2 bg-blue-600 text-white rounded mt-4">
              Sign in with Google
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {nutritionKeys.map(key => (
            <div key={key} className="flex justify-between items-center">
              <label className="font-medium capitalize">{key}</label>
              <input
                type="number"
                value={nutrition[key]}
                onChange={(e) => handleSettingChange(key, Number(e.target.value))}
                className="border rounded p-2 w-24 text-black"
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="font-medium">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded p-2 w-48 text-black"
              placeholder="Enter password"
            />
            <button onClick={() => setShowPassword(prev => !prev)} aria-label="Toggle password visibility">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <button className="w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg text-xl flex items-center justify-center">
          <FiPlus size={24} />
        </button>
        <button className="w-14 h-14 bg-gray-500 text-white rounded-full shadow-lg text-xl flex items-center justify-center">
          <FiMic size={24} />
        </button>
      </div>
    </div>
  );
}

function NutritionCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="text-2xl font-bold">{value} <span className="text-sm">{unit}</span></p>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
