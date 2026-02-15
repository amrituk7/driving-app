import { Link } from "react-router-dom";
import { Car, Users, Calendar, BookOpen, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Track all your students, their progress, transmission type, and lesson history in one place.",
  },
  {
    icon: Calendar,
    title: "Lesson Scheduling",
    description: "Book, reschedule, and manage lessons with an intuitive calendar-based system.",
  },
  {
    icon: Car,
    title: "Vehicle Tracking",
    description: "Keep records of your teaching vehicles, features, and maintenance schedules.",
  },
  {
    icon: BookOpen,
    title: "Resources & Tips",
    description: "Share driving tips, road notes, and important study materials with your students.",
  },
  {
    icon: Shield,
    title: "Test Preparation",
    description: "Track test dates, monitor readiness, and help students prepare for their driving tests.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">RoadMaster</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/auth?tab=signup"
              className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors px-4 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-slate-50" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-sm text-primary-700 font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Built for Driving Instructors
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight text-balance">
              Manage your driving school with confidence
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty">
              RoadMaster helps driving instructors manage students, schedule lessons, track progress, and share resources -- all from one simple dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth?tab=signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/25"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-balance">
              Everything you need to run your driving school
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              From student management to test preparation, RoadMaster has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-primary-100 group-hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                  <f.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Ready to streamline your teaching?
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Join instructors who trust RoadMaster to manage their driving school.
          </p>
          <Link
            to="/auth?tab=signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/25"
          >
            Create Your Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <Car className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">RoadMaster</span>
          </div>
          <p className="text-sm text-slate-400">
            Built for driving instructors, by driving instructors.
          </p>
        </div>
      </footer>
    </div>
  );
}
