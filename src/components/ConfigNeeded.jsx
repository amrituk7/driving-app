import { AlertTriangle, Settings, Key, ExternalLink } from "lucide-react";

export default function ConfigNeeded() {
  const envVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Configuration Needed</h1>
                <p className="text-primary-100 text-sm">RoadMaster requires Firebase to run</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Firebase environment variables are missing. The app cannot initialize without them.
              </p>
            </div>

            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Required Variables
            </h2>

            <div className="space-y-2 mb-6">
              {envVars.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <code className="text-sm text-slate-700 font-mono">{v}</code>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">How to fix this:</h3>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Open the sidebar and click <strong>Vars</strong></li>
                <li>Add each variable above with your Firebase project values</li>
                <li>
                  Find your keys in the{" "}
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline inline-flex items-center gap-1"
                  >
                    Firebase Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>The app will reload automatically</li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              RoadMaster v1.0 -- Driving Instructor Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
